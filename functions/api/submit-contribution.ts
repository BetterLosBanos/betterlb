// 1. Define the environment variables shape
interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

// 2. Define the expected payload from your React form
interface SubmissionPayload {
  title: string;
  content: string;
}

// 3. Define the minimal response we care about from GitHub's API
interface GitHubIssueResponse {
  html_url: string;
  number: number;
  id: number;
}

export const onRequestPost: PagesFunction<Env> = async context => {
  const { env, request } = context;

  try {
    // Standardize parsing with type safety
    const payload = (await request.json()) as SubmissionPayload;

    if (!payload.title || !payload.content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title or content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return new Response(
        JSON.stringify({
          error: 'Server configuration missing (Secrets/Vars)',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Post to GitHub API for your Organization Repository
    const ghResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'BetterLB-Portal',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          body: payload.content,
          labels: ['contribution'],
        }),
      }
    );

    // Parse the response using our interface instead of 'any'
    const result = (await ghResponse.json()) as GitHubIssueResponse;

    return new Response(
      JSON.stringify({
        success: ghResponse.ok,
        issueUrl: result.html_url,
        issueNumber: result.number,
      }),
      {
        status: ghResponse.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Internal Server Error';

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
