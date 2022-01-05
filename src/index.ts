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

// todo: add types
async function createIssue({ issue }: { issue: any }) {
  const linearAPIToken = getInput("linear-api-token", { required: true });
  const teamId = getInput("team-id", { required: true });
  const stateId = getInput("state-id", { required: true });

  const { data } = await axios({
    url: LINEAR_API_URL,
    method: "POST",
    data: JSON.stringify({
      query: createIssueTemplate({ teamId, stateId, description: issue.body, title: issue.title }),
    }),
    headers: {
      Authorization: linearAPIToken,
      "Content-Type": "application/json",
    },
  });

  // console.log({ request: JSON.stringify(request) });

  if (data.success) {
    console.log("Successfully created the issue!");
  }
}

const createIssueTemplate = ({ title, description, teamId, stateId }: CreateIssueOptions) => `
  mutation IssueCreate {
    issueCreate(
        input: {
            title: "${title}"
            description: "${description}"
            teamId: "${teamId}"
            stateId: "${stateId}"
        }
    ) {
        success
    }
  }
`;

try {
  main();
} catch (err) {
  if (err instanceof Error) {
    setFailed(err.message);
  }
}

interface CreateIssueOptions {
  title: string;
  description: string;
  teamId: string;
  stateId: string;
}
