---
"@paypal/react-paypal-js": minor
---

Rename the v6 server-side `useFetchEligibleMethods` to `fetchEligibleMethods` and move it out of the `hooks/` directory. It is a plain server-side async function (`import "server-only"`, called with `await`), not a React hook — the `use` prefix falsely signaled a hook and tripped `eslint-plugin-react-hooks` (`rules-of-hooks` / `no-unnecessary-use-prefix`) in consumer projects, producing false "React Hook cannot be called in an async function / conditionally" errors.

Also renames the client hook `useEligibleMethods`'s public option/result types `UseFetchEligibleMethodsOptions` / `UseFetchEligibleMethodsResult` to `UseEligibleMethodsOptions` / `UseEligibleMethodsResult` to match the hook name.

All previous names remain exported as `@deprecated` aliases, so this is non-breaking:

- `useFetchEligibleMethods` → `fetchEligibleMethods` (from `@paypal/react-paypal-js/sdk-v6/server`)
- `UseFetchEligibleMethodsOptions` → `UseEligibleMethodsOptions`
- `UseFetchEligibleMethodsResult` → `UseEligibleMethodsResult`

The deprecated aliases will be removed in the next major release.
