import { ToolDefinition } from './tool-registry';

export interface CalculatorParams {
  operation: 'add' | 'subtract' | 'multiply' | 'divide';
  operand1: number;
  operand2: number;
}

export const calculatorTool: ToolDefinition = {
  name: 'calculator',
  description: 'A simple calculator that performs basic arithmetic operations.',
  input_schema: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide'],
        description: 'The arithmetic operation to perform.'
      },
      operand1: {
        type: 'number',
        description: 'The first operand.'
      },
      operand2: {
        type: 'number',
        description: 'The second operand.'
      }
    },
    required: ['operation', 'operand1', 'operand2']
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  handler: async (params: CalculatorParams) => {
    switch (params.operation) {
      case 'add':
        return params.operand1 + params.operand2;
      case 'subtract':
        return params.operand1 - params.operand2;
      case 'multiply':
        return params.operand1 * params.operand2;
      case 'divide':
        if (params.operand2 === 0) throw new Error('Division by zero');
        return params.operand1 / params.operand2;
      default:
        throw new Error('Invalid operation');
    }
  }
};
