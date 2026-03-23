import { loadCoreSdkScript } from "../../../src/v6";
import type {
    GooglePayApprovePaymentResponse,
    GooglePayConfig,
    GooglePayConfigFromFindEligibleMethods,
    GooglePayConfirmOrderOptions,
    GooglePayPaymentContact,
    GooglePayPaymentMethodData,
    GooglePayPaymentsInstance,
    GooglePayOneTimePaymentSession,
    PayPalV6Namespace,
} from "../index";

/**
 * Type test for GooglePay payments integration
 *
 * @remarks
 * This test verifies TypeScript compilation and type inference.
 * The function is never executed — it's used for type-checking only.
 */
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

    const googlePayDetails = paymentMethods.getDetails("googlepay");
    const { config } = googlePayDetails;

    // Verify config fields are camelCase (matching runtime after SDK's camelizeObjectKeys)
    const _configType: GooglePayConfigFromFindEligibleMethods = config;
    const _eligible: boolean = config.eligible;
    const _merchantCountry: string = config.merchantCountry;
    const _apiVersion: number = config.apiVersion;
    const _apiVersionMinor: number = config.apiVersionMinor;
    const _merchantId: string = config.merchantInfo.merchantId;
    const _merchantOrigin: string = config.merchantInfo.merchantOrigin;
    const _supportedNetworks =
        config.allowedPaymentMethods[0].parameters.supportedNetworks;
    const _gateway: string =
        config.allowedPaymentMethods[0].tokenizationSpecification.parameters
            .gateway;
    const _gatewayMerchantId: string =
        config.allowedPaymentMethods[0].tokenizationSpecification.parameters
            .gatewayMerchantId;

    const googlePaySession: GooglePayOneTimePaymentSession =
        sdkInstance.createGooglePayOneTimePaymentSession();

    const googlePayConfig: GooglePayConfig =
        googlePaySession.formatConfigForPaymentRequest(config);

    // Verify output has the renamed fields (supportedNetworks → allowedCardNetworks, merchantCountry → countryCode)
    const _countryCode: string = googlePayConfig.countryCode;
    const _allowedCardNetworks =
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

    // Type test: Verify exported option and contact types
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

    // Confirm order with PayPal
    const approveResponse: GooglePayApprovePaymentResponse =
        await googlePaySession.confirmOrder(confirmOptions);

    // Verify response structure
    const _orderId: string = approveResponse.id;
    const _status: string = approveResponse.status;
    const _cardBrand: string =
        approveResponse.payment_source.google_pay.card.brand;
    const _lastDigits: string =
        approveResponse.payment_source.google_pay.card.last_digits;

    // Check if 3DS is required
    if (approveResponse.status === "PAYER_ACTION_REQUIRED") {
        googlePaySession.initiatePayerAction();
    }

    // Type test: Verify GooglePayPaymentsInstance has the correct method
    const instance: GooglePayPaymentsInstance = sdkInstance;
    const session = instance.createGooglePayOneTimePaymentSession();

    console.log(
        _configType,
        _eligible,
        _merchantCountry,
        _apiVersion,
        _apiVersionMinor,
        _merchantId,
        _merchantOrigin,
        _supportedNetworks,
        _gateway,
        _gatewayMerchantId,
        _countryCode,
        _allowedCardNetworks,
        _orderId,
        _status,
        _cardBrand,
        _lastDigits,
        googlePayConfig,
        session,
        instance,
    );
}
