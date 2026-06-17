# PayPal React SDK V6 Storybook

Storybook documentation for the PayPal React SDK V6 components.

This is a standalone package that:

- Installs `@paypal/react-paypal-js` from npm, just like a merchant would (in production)
- Uses workspace linking for local development
- Does not share any dependencies with the v5 storybook implementation
- Has its own independent changelog/release process

## Getting Started

### Install dependencies

From the **root** of the paypal-js monorepo:

```bash
npm install
```

This will automatically link the local `@paypal/react-paypal-js` package via npm workspaces.

### Build react-paypal-js first (required for local development)

Before running Storybook, ensure the react-paypal-js package is built:

```bash
npm run build --workspace=@paypal/react-paypal-js
```

### Run Storybook locally

From the root:

```bash
npm run storybook:v6
```

Or from this directory:

```bash
npm run storybook
```

This will start Storybook at http://localhost:6006

### Build for production

```bash
npm run build-storybook:v6
```

This will build the static storybook to `docs/web-sdk-v6-react-storybook`.

## Structure

```
v6/
├── .storybook/           # Storybook configuration
│   ├── main.ts           # Main config (Vite builder, no webpack issues)
│   ├── preview.ts        # Preview config with PayPal decorator
│   └── preview-head.html # CSS styles
├── src/
│   ├── components/       # Reusable components (V6DocPageStructure)
│   ├── decorators/       # Storybook decorators (PayPalProvider)
│   ├── shared/           # Shared utilities and code examples
│   ├── stories/          # Story files
│   │   └── buttons/      # Button component stories
│   └── types/            # TypeScript type definitions
├── package.json          # Independent package configuration
├── tsconfig.json         # TypeScript configuration
└── README.md
```

## Available Stories

- **PayPalOneTimePaymentButton** - Standard PayPal checkout button
- **PayLaterOneTimePaymentButton** - Pay Later / Buy Now Pay Later button
- **VenmoOneTimePaymentButton** - Venmo checkout button
- **PayPalSavePaymentButton** - Save payment method (vaulting) button
- **PayPalGuestPaymentButton** - Guest checkout with credit/debit cards
- **ApplePayOneTimePaymentButton** - Apple Pay one-time payment button (Safari + HTTPS required)

## Environment Variables

Create a `.env` file in this directory (`packages/react-paypal-js-storybook/v6/.env`):

```bash
# Required: PayPal sandbox client ID from https://developer.paypal.com/dashboard/applications/sandbox
STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id_here

# Required for LPM testing: Point to the local websdknodeweb integration API server
STORYBOOK_PAYPAL_API_URL=http://localhost:8000/lpm-demo/api
```

| Variable                             | Required | Description                                                                                                                                                                          |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID` | Yes      | PayPal sandbox client ID. Without this, buttons will not render. Create an app at [developer.paypal.com](https://developer.paypal.com/dashboard/applications/sandbox) to obtain one. |
| `STORYBOOK_PAYPAL_API_URL`           | Yes      | URL of the local `websdknodeweb` integration API server. Must point to `http://localhost:8000/lpm-demo/api` (or custom port if changed). Start the server with `cd ../../websdknodeweb && npm run dev` |

### Running the Storybook with LPM Support

LPMs (Local Payment Methods) require credentials from the `websdknodeweb` integration server:

#### Step 1: Start the websdknodeweb server
```bash
cd ../../websdknodeweb
npm install
npm run dev
# Server will start on http://localhost:8000
```

#### Step 2: Ensure `.env` is configured
```bash
# In packages/react-paypal-js-storybook/v6/.env
STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID=your_client_id
STORYBOOK_PAYPAL_API_URL=http://localhost:8000/lpm-demo/api
```

#### Step 3: Run Storybook
```bash
npm run storybook:v6
# Storybook will open at http://localhost:6006
```

#### Step 4: Test LPMs
Select any LPM story (ideal, giropay, sofort, scalapay, etc.) — credentials will be loaded from the local server.

### Troubleshooting: "Failed to load credentials for [LPM]"

**Error**: `❌ Failed to load credentials for [LPM]. Failed to fetch`

**Solution**: 
- Ensure `websdknodeweb` is running on `http://localhost:8000`
- Verify `STORYBOOK_PAYPAL_API_URL` in `.env` matches the server URL
- Check that the server is responding: `curl http://localhost:8000/lpm-demo/api/client-token`                                                                      |

## Technology Stack

- **Storybook 10.x** - Latest Storybook with Vite builder (solves webpack 4 exports field issue)
- **Vite** - Fast build tool, no webpack configuration needed
- **TypeScript** - Full type safety
- **React 19** - Latest React version

## Local Development with Workspace Linking

This package uses npm workspaces to link the local `@paypal/react-paypal-js` package during development. This means:

1. **Automatic linking**: Changes to `packages/react-paypal-js` are reflected immediately after rebuilding
2. **No npm install needed**: The dependency is resolved via symlink in the root `node_modules`

### Development Workflow

```bash
# 1. Make changes to react-paypal-js
# 2. Rebuild the package
npm run build --workspace=@paypal/react-paypal-js

# 3. Storybook will pick up the changes
npm run storybook:v6
```

### Switching to npm package (for production testing)

To test with the published npm package instead of the local version, change `package.json`:

```json
"dependencies": {
  "@paypal/react-paypal-js": "^X.Y.Z"  // Replace * with specific version
}
```

Then run `npm install` from the v6 directory (not root) to install from npm.

## Publishing

This package has its own independent release process. Changes are tracked in its own CHANGELOG.md.
