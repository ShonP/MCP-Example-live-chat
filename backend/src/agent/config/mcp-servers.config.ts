import * as path from 'path';

export interface McpServerConfig {
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

// Path to local flight MCP server
// From: backend/src/agent/config/ → mcp-server/build/index.js
// Go up 4 levels: config → agent → src → backend → project root
const flightServerPath = path.resolve(
  __dirname,
  '../../../../mcp-server/build/index.js',
);

export const MCP_SERVERS: McpServerConfig[] = [
  {
    name: 'flight-server',
    description: 'Local flight and passenger data MCP server',
    command: 'node',
    args: [flightServerPath],
    enabled: true,
  },
  {
    name: 'fabric-rti',
    description:
      'Microsoft Fabric Real-Time Intelligence MCP server for Kusto, Eventstreams, and Activator',
    command: 'uvx',
    args: ['microsoft-fabric-rti-mcp'],
    env: {
      // Optional: Configure default Kusto cluster
      KUSTO_SERVICE_URI: 'https://help.kusto.windows.net/',
      KUSTO_SERVICE_DEFAULT_DB: 'Samples',
      FABRIC_API_BASE_URL: 'https://api.fabric.microsoft.com/v1',
    },
    enabled: true,
  },
];
