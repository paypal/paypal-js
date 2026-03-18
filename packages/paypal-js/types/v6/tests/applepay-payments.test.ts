import { loadCoreSdkScript } from "../../../src/v6";
import type {
    PayPalV6Namespace,
    ApplePayPaymentToken,
    ApplePayContact,
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
        clientId: "fakeValue",
        components: ["applepay-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("applepay")) {
        return;
    }

    const applePayConfig = paymentMethods.getDetails("applepay").config;

    // Create Apple Pay session (no parameters needed)
    const applePayPaymentSession =
        sdkInstance.createApplePayOneTimePaymentSession();

    // Get config
    const config = await applePayPaymentSession.config();
    console.log(config.merchantCapabilities);
    console.log(config.supportedNetworks);
    console.log(config.tokenNotificationURL);

    // Format config for payment request
    const formattedConfig =
        applePayPaymentSession.formatConfigForPaymentRequest(applePayConfig);
    console.log(formattedConfig.merchantCapabilities);
    console.log(formattedConfig.supportedNetworks);

    // Validate merchant
    const merchantSession = await applePayPaymentSession.validateMerchant({
        validationUrl: "https://example.com/validate",
        displayName: "Test Merchant",
        domainName: "example.com",
    });
    console.log(merchantSession.merchantSession);

    // Confirm order
    const mockToken: ApplePayPaymentToken = {
        paymentData: {
            version: "1.0",
            data: "encrypted-data",
            signature: "signature",
        },
        paymentMethod: {
            displayName: "Visa",
            network: "visa",
            type: "credit",
        },
        transactionIdentifier: "transaction-id",
    };

    const mockBillingContact: ApplePayContact = {
        emailAddress: "user@example.com",
        familyName: "Doe",
        givenName: "John",
    };

    await applePayPaymentSession.confirmOrder({
        orderId: "ORDER123",
        token: mockToken,
        billingContact: mockBillingContact,
    });
}
