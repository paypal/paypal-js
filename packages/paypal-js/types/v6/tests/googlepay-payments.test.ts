import { loadCoreSdkScript } from "../../../src/v6";
import type {
    GooglePayApprovePaymentResponse,
    GooglePayConfirmOrderOptions,
    GooglePayPaymentContact,
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

    const googlePaySession: GooglePayOneTimePaymentSession =
        sdkInstance.createGooglePayOneTimePaymentSession();

    const googlePayConfig =
        googlePaySession.formatConfigForPaymentRequest(config);

    // Mock Google Pay response
    const mockPaymentData = {
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
    let approveResponse: GooglePayApprovePaymentResponse;

    try {
        approveResponse = await googlePaySession.confirmOrder(confirmOptions);

        console.log("Order approved:", approveResponse.id);
    } catch (error) {
        console.error("Order confirmation failed:", error);
    }

    // Type test: Verify GooglePayPaymentsInstance has the correct method
    const instance: GooglePayPaymentsInstance = sdkInstance;
    const session = instance.createGooglePayOneTimePaymentSession();

    console.log("GooglePay types validated successfully");
    console.log("Config:", googlePayConfig);
    console.log("Session:", session);
}
