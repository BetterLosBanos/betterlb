interface Env {
  GITHUB_TOKEN: string;
  GITHUB_REPO: string;
}

interface RequestBody {
  title: string;
  content: string;
}

// 1. Define the success response shape from GitHub
interface GitHubIssueResponse {
  html_url: string;
  number: number;
}

// 2. Define the error response shape from GitHub
interface GitHubErrorResponse {
  message: string;
}

export const onRequestPost: PagesFunction<Env> = async context => {
  const { env, request } = context;

  try {
    const payload = (await request.json()) as RequestBody;

    if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
      return new Response(
        JSON.stringify({
          error: 'Server configuration missing (Secrets/Vars)',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const ghResponse = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/issues`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
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

    const result = await ghResponse.json();

    if (ghResponse.status === 201) {
      // 3. Cast to our specific interface instead of 'any'
      const successData = result as GitHubIssueResponse;
      return new Response(
        JSON.stringify({ success: true, url: successData.html_url }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } else {
      // 4. Cast to error interface
      const errorData = result as GitHubErrorResponse;
      return new Response(
        JSON.stringify({
          success: false,
          error: `GitHub Error: ${errorData.message}`,
        }),
        {
          status: ghResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : 'Internal Server Error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
