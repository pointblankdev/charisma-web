import Anthropic from '@anthropic-ai/sdk';
import { Message, MessageCreateParams } from '@anthropic-ai/sdk/resources';
import { toolRegistry } from './tool-registry';

interface ToolUseBlock {
  type: 'tool_use';
  id: string;
  name: string;
  input: any;
}

interface ToolResultBlock {
  type: 'tool_result';
  tool_use_id: string;
  content: any;
}

interface TextBlock {
  type: 'text';
  text: string;
}

type ContentBlock = ToolUseBlock | ToolResultBlock | TextBlock;

export class SmartAnthropicClient {
  private client: Anthropic;

  constructor(apiKey?: string) {
    this.client = new Anthropic({
      apiKey: apiKey
    });
  }

  /**
   * Smart chat function that automatically handles the complete tool use flow
   */
  async smartChat(message: string, toolNames?: string[], maxIterations = 20): Promise<Message> {
    const tools = toolNames
      ? toolNames.map(name => {
          const tool = toolRegistry.getTool(name);
          if (!tool) throw new Error(`Tool ${name} not found`);
          return tool;
        })
      : toolRegistry.getAllTools();

    let currentMessages: MessageCreateParams['messages'] = [{ role: 'user', content: message }];

    let iterations = 0;
    let finalResponse: Message | null = null;

    while (iterations < maxIterations) {
      // Make request to Claude
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: currentMessages,
        tools
      });

      // console.log('Response:', JSON.stringify(response, null, 2));

      // If Claude wants to use tools
      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter(
          (block): block is ToolUseBlock => block.type === 'tool_use'
        );

        // Handle each tool use request
        const toolResults: ToolResultBlock[] = [];
        for (const toolUse of toolUseBlocks) {
          try {
            // Execute tool
            const tool = toolRegistry.getTool(toolUse.name);
            if (!tool?.handler) {
              throw new Error(`No handler found for tool ${toolUse.name}`);
            }
            const result = await tool.handler(toolUse.input);

            // console.log('Tool result:', toolUse, result);
            // Format tool result
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: typeof result === 'string' ? result : JSON.stringify(result)
            });
          } catch (error: any) {
            console.error('Tool execution error:', error);
            // Handle tool execution errors
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${error.message}`
            });
          }
        }

        // Update conversation with tool results
        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: response.content },
          { role: 'user', content: toolResults }
        ];

        iterations++;
        continue;
      }

      // If Claude is done (no more tool use needed)
      finalResponse = response;
      break;
    }

    if (!finalResponse) {
      throw new Error(`Exceeded maximum iterations (${maxIterations})`);
    }

    return finalResponse;
  }
}
