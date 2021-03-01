interface PayPalScriptQueryParameters {
    "client-id": string;
    // loadScript() supports an array and will convert it
    // to the correct merchant-id and data-merchant-id string values
    "merchant-id"?: string[] | string;
    currency?: string;
    intent?: string;
    commit?: boolean;
    vault?: boolean | string;
    components?: string;
    "disable-funding"?: string;
    "enable-funding"?: string;
    "disable-card"?: string;
    "integration-date"?: string;
    debug?: boolean | string;
    "buyer-country"?: string;
    locale?: string;
}

interface PayPalScriptDataAttributes {
    "data-partner-attribution-id"?: string;
    "data-csp-nonce"?: string;
    "data-order-id"?: string;
    "data-page-type"?: string;
    "data-client-token"?: string;
    "data-merchant-id"?: string;
    "data-namespace"?: string;
}

export interface PayPalScriptOptions
    extends PayPalScriptQueryParameters,
        PayPalScriptDataAttributes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    sdkBaseURL?: string;
}
