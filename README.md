# lcov-report-action

[![build](https://github.com/nohmad/lcov-report-action/actions/workflows/build.yml/badge.svg)](https://github.com/nohmad/lcov-report-action/actions/workflows/build.yml)

Add summary of coverage report as comment on Pull Request.

## Usage

No need to run if not triggered by pull_request

```yaml
    - name: Coverage Report on Pull Request
      uses: nohmad/lcov-report-action@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        lcov-info: coverage/lcov.info
      if: github.event_name == 'pull_request'
```