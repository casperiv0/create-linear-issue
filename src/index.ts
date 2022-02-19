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

async function createIssue({ issue }: { issue: any }) {
  const linearAPIToken = getInput("linear-api-token", { required: true });
  const teamId = getInput("team-id", { required: true });
  const stateId = getInput("state-id", { required: true });

  console.debug("issue data: ", {
    issue: { id: issue.id, description: issue.body ?? "", title: issue.title },
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

  if (data.success) {
    console.log("Successfully created the issue!");
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
