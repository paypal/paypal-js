import { loadCoreSdkScript } from "../../../src/v6";
import type {
    GooglePayConfig,
    GooglePayConfigFromFindEligibleMethods,
    GooglePayConfirmOrderOptions,
    GooglePayPaymentContact,
    GooglePayPaymentMethodData,
    GooglePayPaymentsInstance,
    GooglePayOneTimePaymentSession,
    PayPalV6Namespace,
} from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
    let paypal: PayPalV6Namespace | null;

    try {
        paypal = await loadCoreSdkScript({
            environment: "sandbox",
            debug: true,
        });
    } catch (err) {
        throw new Error(`Failed to load the paypal sdk script: ${err}`);
    }

    if (!paypal?.createInstance) {
        throw new Error("Invalid paypal object for v6");
    }

    if (!paypal?.version) {
        throw new Error("PayPal v6 namespace missing version property");
    }

    const sdkInstance = await paypal.createInstance({
        clientToken: "fakeValue",
        components: ["googlepay-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("googlepay")) {
        return;
    }

    // Verify getDetails returns GooglePayConfigFromFindEligibleMethods with camelCase fields
    const googlePayDetails = paymentMethods.getDetails("googlepay");
    const config: GooglePayConfigFromFindEligibleMethods =
        googlePayDetails.config;

    // Verify camelCase config field access
    config.eligible;
    config.merchantCountry;
    config.apiVersion;
    config.apiVersionMinor;
    config.merchantInfo.merchantId;
    config.merchantInfo.merchantOrigin;
    config.allowedPaymentMethods[0].parameters.supportedNetworks;
    config.allowedPaymentMethods[0].tokenizationSpecification.parameters
        .gateway;
    config.allowedPaymentMethods[0].tokenizationSpecification.parameters
        .gatewayMerchantId;

    // Create session and format config
    const googlePaySession: GooglePayOneTimePaymentSession =
        sdkInstance.createGooglePayOneTimePaymentSession();

    // Verify output has renamed fields (supportedNetworks → allowedCardNetworks, merchantCountry → countryCode)
    const googlePayConfig: GooglePayConfig =
        googlePaySession.formatConfigForPaymentRequest(config);
    googlePayConfig.countryCode;
    googlePayConfig.allowedPaymentMethods[0].parameters.allowedCardNetworks;

    // Mock Google Pay response (simulating Google's onPaymentAuthorized callback)
    const mockPaymentData: GooglePayPaymentMethodData = {
        description: null,
        tokenizationData: {
            type: "PAYMENT_GATEWAY",
            token: "mock_token",
        },
        type: "CARD",
        info: {
            cardDetails: "1234",
            cardNetwork: "VISA",
            assuranceDetails: {
                accountVerified: true,
                cardHolderAuthenticated: true,
            },
        },
    };

    const shippingAddress: GooglePayPaymentContact = {
        name: "John Doe",
        postalCode: "12345",
        countryCode: "US",
        phoneNumber: "555-1234",
        address1: "123 Main St",
        address2: "",
        address3: "",
        locality: "Anytown",
        administrativeArea: "CA",
        sortingCode: "",
    };

    const confirmOptions: GooglePayConfirmOrderOptions = {
        orderId: "ORDER-123",
        paymentMethodData: mockPaymentData,
        email: "buyer@example.com",
        shippingAddress,
    };

    // Confirm order and verify response structure
    const approveResponse = await googlePaySession.confirmOrder(confirmOptions);
    approveResponse.id;
    approveResponse.status;
    approveResponse.payment_source.google_pay.card.brand;
    approveResponse.payment_source.google_pay.card.last_digits;

    // Check if 3DS is required
    if (approveResponse.status === "PAYER_ACTION_REQUIRED") {
        googlePaySession.initiatePayerAction();
    }

    // Verify GooglePayPaymentsInstance narrowing from SdkInstance
    const instance: GooglePayPaymentsInstance = sdkInstance;
    instance.createGooglePayOneTimePaymentSession();

    // Verify getDetails config can be passed directly to formatConfigForPaymentRequest
    const mockConfig: GooglePayConfigFromFindEligibleMethods = {
        eligible: true,
        merchantCountry: "US",
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
            {
                type: "CARD",
                parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    supportedNetworks: [
                        "VISA",
                        "MASTERCARD",
                        "AMEX",
                        "DISCOVER",
                    ],
                    billingAddressRequired: true,
                    assuranceDetailsRequired: true,
                    billingAddressParameters: {
                        format: "FULL",
                    },
                },
                tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                        gateway: "paypalsb",
                        gatewayMerchantId: "mockGatewayMerchantId",
                    },
                },
            },
        ],
        merchantInfo: {
            merchantOrigin: "https://example.com",
            merchantId: "mockMerchantId",
        },
    };

    // This is the merchant's primary flow: getDetails → formatConfigForPaymentRequest
    const formattedConfig: GooglePayConfig =
        googlePaySession.formatConfigForPaymentRequest(mockConfig);

    // Verify output matches Google Pay API requirements
    formattedConfig.countryCode;
    formattedConfig.apiVersion;
    formattedConfig.apiVersionMinor;
    formattedConfig.merchantInfo.merchantId;
    formattedConfig.allowedPaymentMethods[0].parameters.allowedAuthMethods;
    formattedConfig.allowedPaymentMethods[0].parameters.allowedCardNetworks;
    formattedConfig.allowedPaymentMethods[0].tokenizationSpecification
        .parameters.gateway;
}
