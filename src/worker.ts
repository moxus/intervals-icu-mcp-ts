/// <reference types="@cloudflare/workers-types" />
import { createMcpHandler } from 'agents/mcp';
import { createMcpServer } from './server.js';

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Extract credentials from query parameters
    const athleteId = url.searchParams.get('athleteId');
    const apiKey = url.searchParams.get('apiKey');

    if (!athleteId || !apiKey) {
      return new Response('Missing required query parameters: athleteId and apiKey', {
        status: 400,
      });
    }

    // Type assertion needed: our McpServer and agents' bundled McpServer have
    // identical APIs but separate type declarations due to different SDK versions.
    const server = createMcpServer(athleteId, apiKey);
    return createMcpHandler(server as any)(request, env, ctx);
  },
};
