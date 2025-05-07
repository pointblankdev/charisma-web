---
description: >-
  Welcome to the Liquidity Pools & Tokens API documentation. This API powers our
  decentralized finance (DeFi) data layer on the Stacks blockchain, aggregating
  detailed information about liquidity pools
---

# Introduction

### What This API Does

* **Aggregates Liquidity Pool Data:**\
  Retrieve comprehensive details about liquidity pools—including reserves, fees, supply, and more—across various trading pairs.
* **Provides Token Metadata:**\
  Access up-to-date metadata for tokens used across the ecosystem. This includes names, symbols, decimals, images, and descriptions.
* **Optimized for Performance:**\
  Utilizes the Dexterity SDK with parallel requests (up to 10) and API key rotation to ensure fast and reliable data fetching.

### Who Should Use This API

This documentation is intended for developers integrating DeFi data into DEXs, portfolio trackers, analytics dashboards, or any other application that benefits from real-time liquidity and token insights on the Stacks blockchain.

## Landing Directory – Add / Update Apps

The landing page at _charisma.rocks_ displays a grid of Charisma sub-applications.  
The data powering those cards lives in a single TypeScript file: [`lib/apps.ts`](./lib/apps.ts).

Each entry follows the `AppInfo` interface:

```ts
interface AppInfo {
  title: string;
  description: string;
  href: string;       // full URL including protocol
  image?: string;     // optional path within /public or remote URL
}
```

To add a new sub-app just append another object to the exported `APPS` array.
No additional code changes or redeploy steps are required – the landing page
will automatically pick it up on the next build/deploy.

```ts
APPS.push({
  title: 'New Cool App',
  description: 'Short description…',
  href: 'https://new-app.charisma.rocks'
})
```

Keep descriptions concise (ideally 1–2 sentences) to preserve the layout.
If you provide an `image` make sure the asset exists under `public/` or is a
remote URL permitted by `next.config.js`.
