import { notice, setFailed, error, info } from '@actions/core';
import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import * as fs from 'fs';
import { readFileSync } from 'fs';
import { config } from './config';
import axios, { isAxiosError } from 'axios';

async function validateSubscription(): Promise<void> {
  const eventPath = process.env.GITHUB_EVENT_PATH
  let repoPrivate: boolean | undefined

  if (eventPath && fs.existsSync(eventPath)) {
    const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
    repoPrivate = eventData?.repository?.private
  }

  const upstream = 'step-security/update-pr-description'
  const action = process.env.GITHUB_ACTION_REPOSITORY
  const docsUrl =
    'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions'

  core.info('')
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m')
  core.info(`Secure drop-in replacement for ${upstream}`)
  if (repoPrivate === false)
    core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m')
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`)
  core.info('')

  if (repoPrivate === false) return

  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com'
  const body: Record<string, string> = {action: action || ''}
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body,
      {timeout: 3000}
    )
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      core.error(
        `\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`
      )
      core.error(
        `\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`
      )
      process.exit(1)
    }
    core.info('Timeout or API not reachable. Continuing to next step.')
  }
}

export async function updatePullRequestBody(): Promise<void> {
  await validateSubscription();
  const octokit = getOctokit(config.token);
  const { owner, repo } = context.repo;

  let pullRequestNumber = context.payload.pull_request?.number;
  if (!pullRequestNumber) {
    const { data: prs } =
      await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: context.sha,
      });

    pullRequestNumber = prs.find(
      (pr) =>
        context.payload.ref === `refs/heads/${pr.head.ref}` &&
        pr.state === 'open'
    )?.number;
  }

  if (!pullRequestNumber) {
    setFailed(
      `${context.eventName} at commit ${context.sha} has no associated open pull request`
    );
    return;
  }

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });
  let pullRequestDescription = pr.body || '';

  let newContent =
    config.contentIsFilePath === 'true'
      ? readFileSync(config.content, 'utf8')
      : config.content;

  if (config.contentRegex) {
    const match = newContent.match(
      new RegExp(config.contentRegex, config.contentRegexFlags)
    );
    if (match) {
      notice('Using extracted content from regex match.');
      newContent = match.join('');
    }
  }

  const re = new RegExp(config.regex, config.regexFlags);
  const hasMatch = re.test(pullRequestDescription);

  if (hasMatch) {
    notice('Match found in PR body. Replacing matched section.');
    pullRequestDescription = pullRequestDescription.replace(re, newContent);
  } else if (config.appendContentOnMatchOnly !== 'true') {
    if (pullRequestDescription) {
      notice('Appending content to PR body.');
      pullRequestDescription += newContent;
    } else {
      notice('Setting PR body to new content.');
      pullRequestDescription = newContent;
    }
  } else {
    notice('No match and appendContentOnMatchOnly is true. Skipping update.');
    return;
  }
  notice(`new PR description: ${pullRequestDescription}`);
  await octokit.rest.pulls.update({
    owner,
    repo,
    pull_number: pullRequestNumber,
    body: pullRequestDescription,
  });
  notice('Pull request body updated successfully.');
}
