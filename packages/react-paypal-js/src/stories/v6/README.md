# V6 Stories

This directory contains Storybook stories for the V6 API architecture.

## Architecture Differences

### V5 (Legacy)

- Uses `PayPalScriptProvider`
- Manual script loading and state management
- Component-based approach

### V6 (New)

- Uses `PayPalProvider`
- Simplified API
- Declarative configuration

## Directory Structure

```
v6/
├── README.md                           # This file
├── constants.ts                        # V6-specific constants
├── decorators/                         # V6-specific decorators
│   ├── index.ts                        # Barrel export
│   └── PayPalProviderDecorator.tsx     # Main V6 provider decorator
├── utils/                              # V6-specific utilities
│   ├── index.ts                        # Barrel export
│   └── mockHelpers.ts                  # Mock data helpers
└── buttons/                            # Button components stories
    ├── PayPalOneTimePaymentButton.stories.tsx
    ├── PayLaterOneTimePaymentButton.stories.tsx
    └── code.ts                         # Code snippets for docs
```

## Usage

All V6 stories use the `PayPalProviderDecorator` to ensure proper isolation from V5 components.

## Navigation in Storybook

Stories will appear under the "V6" namespace in the sidebar:

- V6 / Buttons / PayPal One-Time Payment
- V6 / Buttons / PayLater One-Time Payment
