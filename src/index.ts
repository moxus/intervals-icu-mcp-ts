#!/usr/bin/env node
import { Command } from 'commander';
import dotenv from 'dotenv';
import { startServer } from './server.js';
import { IntervalsClient } from './api.js';

dotenv.config();

const program = new Command();

program
  .name('intervals-mcp')
  .description('MCP Server for Intervals.icu API')
  .version('1.0.0');

// Helper to check env vars
function getEnvConfig() {
  const athleteId = process.env.ATHLETE_ID;
  const apiKey = process.env.API_KEY;

  if (!athleteId || !apiKey) {
    console.error('Error: ATHLETE_ID and API_KEY must be set in environment variables (or .env file).');
    process.exit(1);
  }
  return { athleteId, apiKey };
}

program
  .command('verify')
  .description('Verify the setup by fetching the athlete profile.')
  .action(async () => {
    const { athleteId, apiKey } = getEnvConfig();
    console.log(`Verifying connection for Athlete ID: ${athleteId}...`);

    const client = new IntervalsClient(athleteId, apiKey);
    try {
      const profile = await client.getAthleteProfile();
      console.log('✅ Connection Successful!');
      console.log(`Athlete: ${profile.firstname} ${profile.lastname} (${profile.id})`);
      console.log(`City: ${profile.city}, ${profile.country}`);
    } catch (error: any) {
      console.error('❌ Connection Failed.');
      console.error(error.message);
      process.exit(1);
    }
  });

// Default action: Start MCP Server
program
  .action(async () => {
    const { athleteId, apiKey } = getEnvConfig();
    try {
      // Note: MCP SDK usually logs to stderr so it doesn't interfere with stdio transport
      await startServer(athleteId, apiKey);
    } catch (error) {
      console.error("Failed to start MCP server:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
