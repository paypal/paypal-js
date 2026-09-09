---
"@paypal/paypal-js": patch
---

Guard the `environment` option against prototype pollution in `validateArguments()`.

`processOptions()` already read `environment` via `Object.prototype.hasOwnProperty.call()`, but `validateArguments()` (v5 `loadScript`) and the v6 `loadCoreSdkScript` validator still destructured it directly, so a polluted `Object.prototype.environment` was picked up before those guards ran. On the v5 path a junk value would throw and break `loadScript()` entirely; on the v6 path a polluted `"sandbox"` value would pass validation and silently load the sandbox SDK. Both validators now use an own-property check so inherited values are ignored.
