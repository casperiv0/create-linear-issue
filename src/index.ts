import axios from "axios";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";

const LINEAR_API_URL = "https://api.linear.app/graphql";

async function main() {
  const { issue } = context.payload;
  if (!issue) {
    throw new Error("Could not find current issue");
  }

  await createIssue({ issue });
}

export async function createIssue({ issue }: { issue: any }) {
  const linearAPIToken = getInput("linear-api-token", { required: true });
  const teamId = getInput("team-id", { required: true });
  const stateId = getInput("state-id", { required: true });

  console.debug("issue data: ", {
    issue,
  });

  const body = JSON.stringify({
    query: `mutation IssueCreate($title: String!, $description: String!, $teamId: String!, $stateId: String!) {
      issueCreate(
          input: {
              title: $title
              description: $description
              teamId: $teamId
              stateId: $stateId
          }
      ) {
          success
          issue {
            id
          }
      }
  }`,
    variables: {
      title: issue.title,
      description: issue.body,
      teamId,
      stateId,
    },
  });

  const { data } = await axios({
    url: LINEAR_API_URL,
    method: "POST",
    data: body,
    headers: {
      Authorization: linearAPIToken,
      "Content-Type": "application/json",
    },
  });

  if (data.data.issueCreate.success) {
    console.log("Successfully created the issue!");

    const url = issue.html_url;
    const issueId = data.data?.issueCreate?.issue?.id;

    if (issueId) {
      await attachGitHubURLToIssue(url, issueId, linearAPIToken);
    }
  }
}

try {
  main();
} catch (err) {
  console.error({ err });

  if (err instanceof Error) {
    setFailed(err.message);
  }

  setFailed("Could not create the Linear issue. Unknown error");
}

async function attachGitHubURLToIssue(url: string, issueId: string, apiToken: string) {
  const body = JSON.stringify({
    query: `mutation LinkToIssue($url: String!, $issueId: String!, $title: String!) {
      attachmentLinkURL(url: $url, issueId: $issueId, title: $title) {
        attachment {
          id
        }
      }
  }`,
    variables: {
      url,
      issueId,
      title: "Original GitHub Issue",
    },
  });

  const { data } = await axios({
    url: LINEAR_API_URL,
    method: "POST",
    data: body,
    headers: {
      Authorization: apiToken,
      "Content-Type": "application/json",
    },
  });

  return data;
}
