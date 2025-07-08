import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as core from '@actions/core';
import axios from 'axios';


// Auto-generated unit tests for PR body updater
describe('PR Body Updater Tests', () => {
  let mockNotice: jest.Mock;
  let mockSetFailed: jest.Mock;
  let mockPullsGet: jest.Mock;
  let mockPullsUpdate: jest.Mock;
  let mockListPRs: jest.Mock;

  beforeEach(() => {
    //mockGetInput = jest.fn((name) => "");
    mockNotice = jest.fn();
    mockSetFailed = jest.fn();

    // Mock axios for validateSubscription
    jest.spyOn(axios, 'get').mockResolvedValue({ data: {} });
    mockPullsGet = jest
      .fn()
      .mockResolvedValue({ data: { body: 'old PR body' } } as never);
    mockPullsUpdate = jest
      .fn()
      .mockResolvedValue({ data: { body: 'new PR body' } } as never);
    mockListPRs = jest.fn().mockResolvedValue({
      data: [
        { number: 456, head: { ref: 'main' }, state: 'open' },
        { number: 457, head: { ref: 'main' }, state: 'closed' },
        { number: 458, head: { ref: 'main' }, state: 'draft' },
      ],
    } as never);

    jest.resetModules();
    jest.doMock('@actions/github', () => {
      const original: any = jest.requireActual('@actions/github');
      return {
        ...original,
        context: {
          repo: {
            owner: 'owner',
            repo: 'repo',
          },
          payload: {
            pull_request: { number: 456 },
            ref: 'refs/heads/main',
            sha: 'mock-sha',
          },
        },
        getOctokit: jest.fn(() => ({
          rest: {
            pulls: {
              get: mockPullsGet,
              update: mockPullsUpdate,
            },
            repos: {
              listPullRequestsAssociatedWithCommit: mockListPRs,
            },
          },
        })),
      };
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });
  });

  it('replaces PR body content on total regex match', async () => {
    // Customize mockGetInput and other mocks for this test case
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'new PR body';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        default:
          return '';
      }
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'new PR body',
    });
    expect(mockListPRs).not.toHaveBeenCalled();
    expect(mockSetFailed).not.toHaveBeenCalled();

    // Add assertions here
  });

  it('replaces PR body content on partial regex match', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'REPLACEMENT TEXT';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'old.*body';
        default:
          return '';
      }
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'REPLACEMENT TEXT',
    });
  });

  it('replace PR body content on case insensitive regex', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'CASE INSENSITIVE MATCH';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'OLD.*BODY';
        case 'regexFlags':
          return 'i';
        default:
          return '';
      }
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'CASE INSENSITIVE MATCH',
    });
  });

  it('replace PR body content on newline regex match', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'NEWLINE REPLACEMENT';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'old.*body';
        case 'regexFlags':
          return 's';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({
      data: { body: 'old\nPR\nbody' },
    } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'NEWLINE REPLACEMENT',
    });
  });

  it('replace all instances of match in PR body content on global regex match', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'GLOBAL REPLACEMENT';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'old';
        case 'regexFlags':
          return 'g';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({
      data: { body: 'old text old body old end' },
    } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription:
        'GLOBAL REPLACEMENT text GLOBAL REPLACEMENT body GLOBAL REPLACEMENT end',
    });
  });

  it('append content to PR body on no regex match', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return '\nAPPENDED CONTENT';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'nonexistent';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({
      data: { body: 'existing PR body' },
    } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith('Appending content to PR body.');
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'existing PR body\nAPPENDED CONTENT',
    });
  });

  it('not append content to PR body on no regex match when match only mode is set', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'SHOULD NOT APPEND';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'nonexistent';
        case 'appendContentOnMatchOnly':
          return 'true';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({
      data: { body: 'existing PR body' },
    } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'No match and appendContentOnMatchOnly is true. Skipping update.'
    );
    expect(mockPullsUpdate).not.toHaveBeenCalled();
  });

  it('select from content then replace PR body', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'PREFIX: extracted content SUFFIX';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        case 'contentRegex':
          return 'extracted content';
        default:
          return '';
      }
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Using extracted content from regex match.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'extracted content',
    });
  });

  it('should select all matches from content then replace PR body', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'first match second match third match';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        case 'contentRegex':
          return 'match';
        case 'contentRegexFlags':
          return 'g';
        default:
          return '';
      }
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Using extracted content from regex match.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'matchmatchmatch',
    });
  });

  it('should set empty PR body to content', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'NEW CONTENT FOR EMPTY BODY';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'nonexistent';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({ data: { body: '' } } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith('Setting PR body to new content.');
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'NEW CONTENT FOR EMPTY BODY',
    });
  });

  it('should not set empty PR body to content when match only mode is set', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'SHOULD NOT SET';
        case 'token':
          return 'mock-token';
        case 'regex':
          return 'nonexistent';
        case 'appendContentOnMatchOnly':
          return 'true';
        default:
          return '';
      }
    });

    mockPullsGet.mockResolvedValue({ data: { body: '' } } as never);

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'No match and appendContentOnMatchOnly is true. Skipping update.'
    );
    expect(mockPullsUpdate).not.toHaveBeenCalled();
  });

  it('should lookup the PR via SHA and set content', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'CONTENT FROM SHA LOOKUP';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        default:
          return '';
      }
    });

    jest.doMock('@actions/github', () => {
      const original: any = jest.requireActual('@actions/github');
      return {
        ...original,
        context: {
          repo: {
            owner: 'owner',
            repo: 'repo',
          },
          payload: {
            ref: 'refs/heads/main',
          },
          sha: 'mock-sha',
        },
        getOctokit: jest.fn(() => ({
          rest: {
            pulls: {
              get: mockPullsGet,
              update: mockPullsUpdate,
            },
            repos: {
              listPullRequestsAssociatedWithCommit: mockListPRs,
            },
          },
        })),
      };
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockListPRs).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      commit_sha: 'mock-sha',
    });
    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'CONTENT FROM SHA LOOKUP',
    });
  });

  it('should fail when PR cannot be found', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'SHOULD NOT BE USED';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        default:
          return '';
      }
    });

    const mockEmptyListPRs = jest.fn().mockResolvedValue({ data: [] } as never);

    jest.doMock('@actions/github', () => {
      const original: any = jest.requireActual('@actions/github');
      return {
        ...original,
        context: {
          repo: {
            owner: 'owner',
            repo: 'repo',
          },
          payload: {
            ref: 'refs/heads/feature-branch',
          },
          sha: 'mock-sha',
          eventName: 'push',
        },
        getOctokit: jest.fn(() => ({
          rest: {
            pulls: {
              get: mockPullsGet,
              update: mockPullsUpdate,
            },
            repos: {
              listPullRequestsAssociatedWithCommit: mockEmptyListPRs,
            },
          },
        })),
      };
    });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockEmptyListPRs).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      commit_sha: 'mock-sha',
    });
    expect(mockSetFailed).toHaveBeenCalledWith(
      'push at commit mock-sha has no associated open pull request'
    );
    expect(mockPullsGet).not.toHaveBeenCalled();
    expect(mockPullsUpdate).not.toHaveBeenCalled();
  });

  it('should read file content and set PR body to content', async () => {
    const mockGetInput = jest.fn((name: string) => {
      switch (name) {
        case 'content':
          return 'test-file.txt';
        case 'token':
          return 'mock-token';
        case 'regex':
          return '.*';
        case 'contentIsFilePath':
          return 'true';
        default:
          return '';
      }
    });

    const fs = require('fs');
    const originalReadFileSync = fs.readFileSync;
    const mockReadFileSync = jest
      .spyOn(fs, 'readFileSync')
      .mockImplementation((...args: any[]) => {
        const [path] = args;
        if (path === 'test-file.txt') {
          return 'FILE CONTENT FROM DISK';
        }
        return originalReadFileSync(...args);
      });

    jest.doMock('@actions/core', () => {
      return {
        ...core,
        getInput: mockGetInput,
        notice: mockNotice,
        setFailed: mockSetFailed,
      };
    });

    const { updatePullRequestBody } = require('../src/pr');
    await updatePullRequestBody();

    expect(mockReadFileSync).toHaveBeenCalledWith('test-file.txt', 'utf8');
    expect(mockPullsGet).toHaveBeenCalled();
    expect(mockNotice).toHaveBeenCalledWith(
      'Match found in PR body. Replacing matched section.'
    );
    expect(mockPullsUpdate).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      pull_number: 456,
      pullRequestDescription: 'FILE CONTENT FROM DISK',
    });
  });
});
