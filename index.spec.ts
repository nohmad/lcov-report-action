import main from './index';

import * as core from '@actions/core';
import * as github from '@actions/github';

const getInput = core.getInput as jest.MockedFunction<typeof core.getInput>;
const getOctokit = github.getOctokit as any;

jest.mock('@actions/core');
jest.mock('@actions/github');


describe("lcov-report", () => {
  it("leaves comment for PR", async () => {    
    getInput.mockReturnValueOnce('TOKEN');
    getInput.mockReturnValueOnce('coverage/lcov.info');
    const createComment = jest.fn() as any;
    const listPullRequestsAssociatedWithCommit = jest.fn() as any;
    listPullRequestsAssociatedWithCommit.mockReturnValue({data: [{number: 123}]});
    getOctokit.mockReturnValue({
      repos: {listPullRequestsAssociatedWithCommit},
      issues: {createComment}
    });
    Object.assign(github, {context: {
      repo: {repo: 'repo', owner: 'owner'},
      payload: {after: 'context.payload.after'}
    }});
    
    await main();

    const {repo, owner, commit_sha} = Array.from(listPullRequestsAssociatedWithCommit.mock.calls[0])[0] as any;
    expect({repo, owner}).toEqual(github.context.repo);
    expect(commit_sha).toEqual(github.context.payload.after);
    const {body, issue_number} = Array.from(createComment.mock.calls[0])[0] as any;
    expect(body).toMatch(/Branches: \d+\/\d+ \([\d.]+%\)/);
    expect(body).toMatch(/Lines: \d+\/\d+ \([\d.]+%\)/);
    expect(issue_number).toEqual(123);
  });
});