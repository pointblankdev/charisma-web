# Blaze SDK

Blaze is a scaling solution for Stacks blockchain that enables fast, off-chain transactions with on-chain settlement. It uses off-chain signatures to speed up web3 interactions and create a better user experience.

## Features

- 🚀 **Fast Transactions**: Execute transfers instantly with off-chain signatures
- 🔒 **Secure**: All transactions are cryptographically signed and verified
- 🌐 **Flexible**: Run as a client or operate a node
- 🔄 **Batch Processing**: Efficient on-chain settlement of multiple transactions
- 📱 **Great UX**: Instant feedback and status updates for users

## Packages

The Blaze SDK is split into multiple packages to serve different needs:

- `@blaze-labs/sdk`: Core client package for dapp developers
- `@blaze-labs/node`: Node operator package for running Blaze nodes
- `@blaze-labs/contracts`: Smart contract package

## Installation

```bash
# Install the core SDK for dapp development
npm install @blaze-labs/sdk

# For node operators
npm install @blaze-labs/node

# For contract development
npm install @blaze-labs/contracts
```

## Quick Start

### Client Usage

```typescript
import { BlazeClient } from '@blaze-labs/sdk';

// Initialize the client
const blaze = new BlazeClient({
  network: 'mainnet',
  nodeUrl: 'https://your-blaze-node.com'
});

// Transfer tokens
const transfer = await blaze.transfer({
  token: 'SP000...TOKEN',  // Token contract
  to: 'SP000...RECIPIENT', // Recipient address
  amount: 100,             // Amount in tokens
});

// Check balances
const balance = await blaze.getBalance('SP000...ADDRESS');
```

### Running a Node

```typescript
import { BlazeNode } from '@blaze-labs/node';

// Initialize the node
const node = new BlazeNode({
  network: 'mainnet',
  privateKey: process.env.PRIVATE_KEY,
  kvStore: 'redis',  // or other supported stores
});

// Start the node
await node.start();
```

## Architecture

Blaze works by:

1. Users sign transfers off-chain
2. Nodes batch multiple transfers together
3. Nodes execute batches on-chain periodically
4. Users get instant feedback while waiting for settlement

## Documentation

For detailed documentation, visit:
- [SDK Documentation](https://docs.blaze.space/sdk)
- [Node Documentation](https://docs.blaze.space/node)
- [Smart Contract Documentation](https://docs.blaze.space/contracts)

## Examples

Check out the `examples` directory for:
- Basic transfer implementation
- Node operation setup
- Complex dapp integration
- Testing and monitoring

## Development

```bash
# Clone the repository
git clone https://github.com/blaze-labs/blaze-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Security

For security concerns, please email security@blaze.space
