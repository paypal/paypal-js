interface PayPalScriptQueryParameters {
    "buyer-country"?: string;
    "client-id": string;
    commit?: boolean;
    components?: string;
    currency?: string;
    debug?: boolean | string;
    "disable-card"?: string;
    "disable-funding"?: string;
    "enable-funding"?: string;
    "integration-date"?: string;
    intent?: string;
    locale?: string;
    // loadScript() supports an array and will convert it
    // to the correct merchant-id and data-merchant-id string values
    "merchant-id"?: string[] | string;
    vault?: boolean | string;
}

interface PayPalScriptDataAttributes {
    "data-client-token"?: string;
    "data-csp-nonce"?: string;
    "data-client-metadata-id"?: string;
    "data-merchant-id"?: string;
    "data-namespace"?: string;
    "data-page-type"?: string;
    "data-partner-attribution-id"?: string;
    "data-sdk-integration-source"?: string;
    "data-user-id-token"?: string;
}

export interface PayPalScriptOptions
    extends PayPalScriptQueryParameters,
        PayPalScriptDataAttributes {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    sdkBaseURL?: string;
}
