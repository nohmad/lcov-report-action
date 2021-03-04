# lcov-report-action

Add summary of coverage report as comment on Pull Request.

## Usage
```yaml
    - name: Coverage Report on Pull Request
      uses: getmiso/lcov-report-action
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        lcov-info: coverage/lcov.info
```