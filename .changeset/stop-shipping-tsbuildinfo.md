---
"@paypal/react-paypal-js": patch
---

Stop shipping the TypeScript incremental-build cache (`dist/tsconfig.lib.tsbuildinfo`) in the published npm package. The build-info file is now written to `node_modules/.cache/tsc/` instead of `dist/`, trimming ~72 kB unpacked (~25 kB gzipped) from the tarball. No functional or API change — the library output is byte-identical.
