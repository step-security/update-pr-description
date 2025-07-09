import { getInput } from '@actions/core';

export interface Config {
  content: string;
  contentIsFilePath: string;
  contentRegex: string;
  contentRegexFlags: string;
  regex: string;
  regexFlags: string;
  appendContentOnMatchOnly: string;
  token: string;
}

export const config: Config = {
  content: getInput('content', {
    required: true,
    trimWhitespace: false,
  }),
  contentIsFilePath: getInput('contentIsFilePath'),
  contentRegex: getInput('contentRegex') || '',
  contentRegexFlags: getInput('contentRegexFlags') || '',
  regex: getInput('regex') || '---.*',
  regexFlags: getInput('regexFlags') || '',
  appendContentOnMatchOnly: getInput('appendContentOnMatchOnly'),
  token: getInput('token', { required: true }),
};
