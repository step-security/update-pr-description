import { notice, setFailed, error, info } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import { readFileSync } from 'fs';
import { config } from './config';
import axios, { isAxiosError } from 'axios';

async function validateSubscription(): Promise<void> {
  const API_URL = `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/subscription`;

  try {
    await axios.get(API_URL, { timeout: 3000 });
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 403) {
      error('Subscription is not valid. Reach out to support@stepsecurity.io');
      process.exit(1);
    } else {
      info('Timeout or API not reachable. Continuing to next step.');
    }
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
