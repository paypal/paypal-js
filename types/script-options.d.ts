interface PayPalScriptQueryParameters {
    buyerCountry?: string;
    clientId: string;
    commit?: boolean;
    components?: string;
    currency?: string;
    debug?: boolean | string;
    disableFunding?: string;
    // loadScript() supports an array and will convert it
    // to the correct enable-funding and disable-funding string values
    enableFunding?: string[] | string;
    integrationDate?: string[] | string;
    intent?: string;
    locale?: string;
    merchantId?: string;
    vault?: boolean | string;
}

interface PayPalScriptDataAttributes {
    dataClientToken?: string;
    dataCspNonce?: string;
    dataClientMetadataId?: string;
    // loadScript() supports an array and will convert it
    // to the correct data-merchant-id string values
    dataMerchantId?: string[] | string;
    dataNamespace?: string;
    dataPageType?: string;
    dataPartnerAttributionId?: string;
    dataSdkIntegrationSource?: string;
    dataUid?: string;
    dataUserIdToken?: string;
}

export interface PayPalScriptOptions
    extends PayPalScriptQueryParameters,
        PayPalScriptDataAttributes {
    sdkBaseUrl?: string;
}
