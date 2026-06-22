---
"@paypal/react-paypal-js": minor
"@paypal/paypal-js": patch
---

feat(lpm): add LPM Generic React wrapper for 34 validated payment methods

Introduces a config-driven factory pattern (Approach 2, ADR DTLAMBO-559) that provides
named React hooks and button components for 34 co-developer-validated LPMs with zero
per-LPM files.

**New exports (`@paypal/react-paypal-js/sdk-v6`):**
- `useLPMOneTimePaymentSession` — generic hook; resolves session method from `LPM_REGISTRY`
- `LPMOneTimePaymentButton` — all-in-one generic button with inline payment fields
- Named hooks: `useIdealOneTimePaymentSession`, `useBancontactOneTimePaymentSession`, … (34 total)
- Named all-in-one buttons: `IdealOneTimePaymentButton`, `BancontactOneTimePaymentButton`, … (34 total)
- Named standalone buttons: `IdealPaymentButton`, `BancontactPaymentButton`, … (34 total)
  — accept a `paymentSession` prop so fields and button can live in separate layout sections
- `LPM_REGISTRY` — single source of truth for all LPM configurations
- Types: `LPMSessionHandle`, `LPMButtonComponentProps`, `LPMFieldComponentProps`, `LPMEnhancedHookReturn`

**New exports (`@paypal/paypal-js`):**
- `LPMComponents`, `LPMSessionMethodName`, `LPMOneTimePaymentSession`, `LPMPaymentsInstance`
  type definitions for LPM SDK integration
