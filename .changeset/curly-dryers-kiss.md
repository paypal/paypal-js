---
"@paypal/paypal-js": minor
---

Updates the v6 script loader with the following changes:

- Adds retry logic so transient script load failures (network blips, CDN hiccups) are retried instead of immediately rejecting.
- Retries up to MAX_SCRIPT_LOAD_RETRIES (5) times with exponential backoff + jitter (RETRY_BASE_DELAY_MS 50ms, capped at RETRY_MAX_DELAY_MS 400ms), and adds a SCRIPT_LOAD_TIMEOUT_MS (10s) timeout so a hung script load also triggers a retry rather than waiting indefinitely.
- Each retry busts the cache via a paypal-sdk-retry query param so the browser doesn't just re-serve a failed response from cache.
- Concurrent calls to loadCoreSdkScript for the same namespace now share a single in-flight retry chain (inFlightScriptLoads map) instead of each independently creating duplicate script elements and retry loops.
