import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { DecisionEngine } from '../services/decisionEngine';

const decisionEngine = new DecisionEngine();

const server = new Server(
  {
    name: 'custos-okx-asp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'custos_approve_transaction',
        description:
          'Evaluates pre-transaction risk on X Layer before paying an ASP provider. Returns verdict (APPROVED | CAUTION), reasoning, and recommended payment structure (full_upfront | split | escrow).',
        inputSchema: {
          type: 'object',
          properties: {
            provider_wallet: {
              type: 'string',
              description: '0x address of the ASP service provider receiving payment',
            },
            buyer_wallet: {
              type: 'string',
              description: '0x address of the buyer AI agent paying for service',
            },
            service_price: {
              type: 'number',
              description: 'Payment price in native OKB or USDT',
            },
            service_category: {
              type: 'string',
              description: 'Category of service (audit, code_generation, trading_signal, data_feed, infrastructure, general)',
            },
            deadline: {
              type: 'string',
              description: 'Optional ISO deadline timestamp',
            },
          },
          required: ['provider_wallet', 'buyer_wallet', 'service_price', 'service_category'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'custos_approve_transaction') {
    try {
      const args = request.params.arguments as any;
      const decision = await decisionEngine.evaluate({
        provider_wallet: args.provider_wallet,
        buyer_wallet: args.buyer_wallet,
        service_price: Number(args.service_price),
        service_category: args.service_category,
        deadline: args.deadline,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(decision, null, 2),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Custos decision engine error: ${err.message}`,
          },
        ],
      };
    }
  }

  throw new Error(`Tool not found: ${request.params.name}`);
});

async function runMcpServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Custos MCP Server running on stdio');
}

if (process.argv[1] && process.argv[1].includes('mcp')) {
  runMcpServer().catch((err) => console.error('MCP Server crash:', err));
}

export { server, decisionEngine };
