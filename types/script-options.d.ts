interface PayPalScriptQueryParameters {
    buyerCountry?: string;
    clientId: string;
    commit?: boolean;
    components?: string;
    currency?: string;
    debug?: boolean | string;
    disableFunding?: string;
    enableFunding?: string;
    integrationDate?: string;
    intent?: string;
    locale?: string;
    // loadScript() supports an array and will convert it
    // to the correct merchant-id and data-merchant-id string values
    merchantId?: string[] | string;
    vault?: boolean | string;
}

interface PayPalScriptDataAttributes {
    dataClientToken?: string;
    dataCspNonce?: string;
    dataClientMetadataId?: string;
    dataMerchantId?: string;
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
