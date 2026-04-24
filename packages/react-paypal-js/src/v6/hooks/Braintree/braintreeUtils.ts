/**
 * Creates a Braintree payment session with error handling and retry prevention.
 *
 * @param sessionCreator - Function that creates the payment session
 * @param failedInstanceRef - Ref tracking which checkout instance failed
 * @param checkoutInstance - Current Braintree checkout instance
 * @param setError - Error state setter
 * @returns The payment session or null if creation fails
 */
export function createBraintreePaymentSession<T>(
  sessionCreator: () => T,
  failedInstanceRef: { current: unknown },
  checkoutInstance: unknown,
  setError: (error: Error | null) => void,
): T | null {
  // Skip retry if this checkout instance already failed
  if (failedInstanceRef.current === checkoutInstance) {
    return null;
  }

  try {
    return sessionCreator();
  } catch (err) {
    failedInstanceRef.current = checkoutInstance;

    const detailedError = new Error(
      "Failed to create Braintree payment session. Ensure the BraintreePayPalProvider is properly initialized with a valid client token and namespace.",
      { cause: err },
    );

    setError(detailedError);
    return null;
  }
}
