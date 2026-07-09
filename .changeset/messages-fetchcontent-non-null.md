---
"@paypal/paypal-js": minor
---

Narrow `PayPalMessagesSession.fetchContent` to return `Promise<MessageContent>` (previously `Promise<MessageContent | null>`). The evergreen SDK never resolves to `null` — on an API error it returns an empty sentinel `MessageContent` (empty `messageItems`) so the `<paypal-message>` element recognizes the error state and collapses. Existing `=== null` checks against the result become dead code but continue to compile.
