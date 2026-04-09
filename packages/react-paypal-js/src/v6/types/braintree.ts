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
    const ns = namespace as Record<string, unknown>;

    if (ns === null || typeof ns !== "object") {
        return false;
    }

    if (typeof (ns.client as Record<string, unknown>)?.create !== "function") {
        return false;
    }

    if (
        typeof (ns.paypalCheckoutV6 as Record<string, unknown>)?.create !==
        "function"
    ) {
        return false;
    }

    return true;
}
