import * as core from '@actions/core';
import { context, getOctokit } from '@actions/github';
import parseLCOV from 'parse-lcov';
import fs from 'fs';

interface CoverageMetric {
  found: number;
  hit: number;
  percent: number;
}

function getMetric(coverages: any[], kind: string): CoverageMetric {
  let hit = 0, found = 0;
  for (const cov of coverages) {
    hit += cov[kind].hit;
    found += cov[kind].found;
  }
  const percent = ((hit / found) * 100) || 0;
  return {hit, found, percent};
}

function getSummary({hit, found, percent}: CoverageMetric) {
  return `${hit}/${found} (${percent.toFixed(1)}%)`;
}

async function main() {
  if (context.eventName != 'pull_request') {
    return;
  }
  const file = fs.readFileSync(core.getInput('lcov-path'));
  const coverages = parseLCOV(file.toString());
  const branches = getMetric(coverages, 'branches');
  const lines = getMetric(coverages, 'lines');
  const body = `<p>Covered ${getSummary(branches)} branches, ${getSummary(lines)} lines</p>`;
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