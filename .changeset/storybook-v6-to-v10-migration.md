---
"@paypal/react-paypal-js": patch
---

Migrate the v5 React SDK Storybook from Storybook 6 to Storybook 10 (`@storybook/react-vite`) and extract it out of this package into its own `@paypal/react-paypal-js-storybook-v5` workspace (mirroring the v6 storybook). This is a tooling/dev-dependency change only — the published package output is unchanged; it removes the Storybook toolchain from this library's devDependencies.
