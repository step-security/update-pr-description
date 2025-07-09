import { updatePullRequestBody } from './pr';
import { setFailed } from '@actions/core';

async function run() {
  try {
    await updatePullRequestBody();
  } catch (err: any) {
    setFailed(err.message || 'Unexpected error occurred.');
  }
}

run();
