import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import parseLCOV from 'parse-lcov';
import fs from 'fs';

function getCoveredPercentInTotal(coverages: any[], kind: string) {
  let hit = 0, found = 0;
  for (const cov of coverages) {
    hit += cov[kind].hit;
    found += cov[kind].found;
  }
  const percent = ((hit / found) * 100) || 0;
  return {hit, found, percent};
}

async function main() {
  if (context.eventName != 'pull_request') {
    return;
  }
  const file = fs.readFileSync(core.getInput('lcov-path'));
  const coverages = parseLCOV(file.toString());
  const branches = getCoveredPercentInTotal(coverages, 'branches');
  const lines = getCoveredPercentInTotal(coverages, 'lines');
  const _branches = `Branches: ${branches.found}/${branches.hit} (${branches.percent.toFixed(2)}%)`;
  const _lines = `Lines: ${lines.found}/${lines.hit} (${lines.percent.toFixed(2)}%)`;
  const body = `<p>${_branches}, ${_lines}</p>`;
  const issue_number = context.payload.pull_request?.number;
  if (!issue_number) {
    return;
  }
  const {repo, owner} = context.repo;
  const octokit = getOctokit(core.getInput('github-token'));
  await octokit.issues.createComment({repo, owner, body, issue_number});
}
main().catch(e => core.setFailed(e.message));

export default main;