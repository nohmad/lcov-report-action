import main from './index';

import * as core from '@actions/core';
import * as github from '@actions/github';
import parseLCOV from 'parse-lcov';
import fs from 'fs';

jest.mock('@actions/core');
jest.mock('@actions/github');
jest.mock('parse-lcov');
jest.mock('fs');

const getInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const getOctokit = github.getOctokit as any;
const _parseLCOV = parseLCOV as jest.MockedFunction<typeof parseLCOV>;

const readFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>;

describe("lcov-report-action", () => {
  it("leaves comment for PR", async () => {
    const lcovInfo = 'coverage/lcov.info';
    getInput.mockReturnValueOnce(lcovInfo);
    getInput.mockReturnValueOnce('TOKEN');
    _parseLCOV.mockReturnValue([{branches: {hit: 2, found: 3}, lines: {hit: 3, found: 5}}] as any);
    readFileSync.mockReturnValue(Buffer.from(''));
    const createComment = jest.fn() as any;
    getOctokit.mockReturnValue({
      issues: {createComment}
    } as any);
    Object.assign(github, {context: {
      eventName: 'pull_request',
      repo: {repo: 'repo', owner: 'owner'},
      payload: {pull_request: {number: 123}}
    }});
    
    await main();

    expect(readFileSync).toHaveBeenCalledWith(lcovInfo);
    const {body, issue_number} = Array.from(createComment.mock.calls[0])[0] as any;
    expect(body).toMatch(/2\/3 \([\d.]+%\) branches/);
    expect(body).toMatch(/3\/5 \([\d.]+%\) lines/);
    expect(issue_number).toEqual(123);
  });

  it("returns immediately if eventName is not pull_request", () => {
    main();
  });

  it("does nothing if issue_number is not present", async () => {
    getInput.mockReturnValueOnce('coverage/lcov.info');
    _parseLCOV.mockReturnValue([{branches: {hit: 3, found: 1}, lines: {hit: 5, found: 3}}] as any);
    readFileSync.mockReturnValue(Buffer.from(''));
    Object.assign(github, {context: {
      eventName: 'pull_request',
      payload: {},
    }});
    
    await main();
  });
});