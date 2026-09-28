/**
 * Read an own property from an options object, ignoring any value inherited
 * from the prototype chain, to prevent prototype-polluted values (CWE-1321)
 * from being silently accepted when the caller's options object omits the
 * property. Local copy of the equivalent helper in @paypal/paypal-js's
 * src/utils.ts, which isn't exported from that package's public entry points.
 */
export function getOwnProperty<T extends object, K extends keyof T>(
  options: T,
  key: K,
): T[K] | undefined {
  return Object.prototype.hasOwnProperty.call(options, key)
    ? options[key]
    : undefined;
}
