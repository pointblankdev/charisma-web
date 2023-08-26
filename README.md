# Charisma Web Client

---

## Built With

- Framework: [Next.js](https://nextjs.org/)
  - [CSS Modules](https://nextjs.org/docs/basic-features/built-in-css-support)
  - [TypeScript](https://nextjs.org/docs/basic-features/typescript)
- CMS: [Multiple Options](https://github.com/vercel/virtual-event-starter-kit#cms)
- Deployment: [Vercel](https://vercel.com/)

## Running Locally

> **NOTE:** Before this setup make sure to deploy the project using 100ms + DatoCMS integration to speed up the setup process.

After the project is deployed on Vercel, you can find `DATOCMS_READ_ONLY_API_TOKEN` and `NEXT_PUBLIC_HMS_TOKEN_ENDPOINT` already setup in the environment-variables section in project settings. The integration also sets up the [rooms](https://docs.100ms.live/server-side/v2/features/room), [templates & roles](https://docs.100ms.live/server-side/v2/foundation/templates-and-roles) associated with it.

First, to set local environment variables you can either use Vercel CLI [vercel env pull](https://vercel.com/docs/cli#commands/env) or just manually copy paste them.

```bash

cp .env.local.example .env.local
```

Then install the package and run the development server:

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000/) to see the landing page.

### **Constants**

`lib/constants.ts` contains a list of variables you should customize.

---