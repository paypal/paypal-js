export interface BraintreeClientInstance {
    [key: string]: unknown;
}

export interface BraintreePayPalCheckoutInstance {
    loadPayPalSDK: () => Promise<BraintreePayPalCheckoutInstance>;
    tokenizePayment: (
        options: Record<string, unknown>,
    ) => Promise<{ nonce: string; details: Record<string, unknown> }>;
    createOneTimePaymentSession: (options: Record<string, unknown>) => unknown;
    createBillingAgreementSession: (
        options: Record<string, unknown>,
    ) => unknown;
    createCheckoutWithVaultSession: (
        options: Record<string, unknown>,
    ) => unknown;
    teardown: () => Promise<void>;
    [key: string]: unknown;
}

export interface BraintreeV6Namespace {
    client: {
        create: (options: {
            authorization: string;
        }) => Promise<BraintreeClientInstance>;
    };
    paypalCheckoutV6: {
        create: (options: {
            client: BraintreeClientInstance;
        }) => Promise<BraintreePayPalCheckoutInstance>;
    };
}

export function validateBraintreeNamespace(
    namespace: unknown,
): namespace is BraintreeV6Namespace {
    const ns = namespace as BraintreeV6Namespace | null | undefined;

    return (
        typeof ns?.client?.create === "function" &&
        typeof ns?.paypalCheckoutV6?.create === "function"
    );
}
