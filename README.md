# Create Linear Issue

Automatically import a created GitHub issue into Linear.

## Inputs

| Name               | Required | Descrition                                                               |
| :----------------- | :------- | :----------------------------------------------------------------------- |
| `linear-api-token` | `true`   | The API key to your Linear team                                          |
| `team-id`          | `true`   | The id to your Linear team                                               |
| `state-id`         | `true`   | The id of what state must be applied (state: 'Todo', 'In Progress', etc) |

## Usage

Create a new workflow file (example: `.github/workflows/linear.yml`) and paste the following:

```yml
name: Create Linear Issue

on:
  issues:
    types: [opened]

jobs:
  create-linear-issue:
    runs-on: ubuntu-latest
    steps:
      - name: Create Linear Issue
        uses: Dev-CasperTheGhost/create-linear-issue@1.3.1
        with:
          # from GitHub Secrets within the repo
          linear-api-token: ${{ secrets.LINEAR_API_TOKEN }}
          team-id: ${{ secrets.TEAM_ID }}
          state-id: ${{ secrets.STATE_ID }}
```
