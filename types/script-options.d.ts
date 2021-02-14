interface PayPalScriptQueryParameters {
    'client-id': string;
    'merchant-id'?: string;
    currency?: string;
    intent?: string;
    commit?: boolean;
    vault?: boolean | string;
    components?: string;
    'disable-funding'?: string;
    'enable-funding'?: string;
    'disable-card'?: string;
    'integration-date'?: string;
    debug?: boolean | string;
    'buyer-country'?: string;
    locale?: string;
}

interface PayPalScriptDataAttributes {
    'data-partner-attribution-id'?: string;
    'data-csp-nonce'?: string;
    'data-order-id'?: string;
    'data-page-type'?: string;
    'data-client-token'?: string;
    'data-merchant-id'?: string;
}

export interface PayPalScriptOptions extends PayPalScriptQueryParameters, PayPalScriptDataAttributes {
    [key: string]: string | boolean | undefined;
    sdkBaseURL?: string;
}
