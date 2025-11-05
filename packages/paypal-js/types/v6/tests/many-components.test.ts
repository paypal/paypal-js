import { loadCoreSdkScript } from "../../../src/v6";
import type { OnApproveDataOneTimePayments, PayPalV6Namespace } from "../index";

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
        components: [
            "paypal-payments",
            "paypal-guest-payments",
            "venmo-payments",
        ],
    });

    sdkInstance.createPayPalOneTimePaymentSession({
        onApprove() {
            return Promise.resolve();
        },
    });

    sdkInstance.createPayPalGuestOneTimePaymentSession({
        onApprove() {
            return Promise.resolve();
        },
    });

    sdkInstance.createVenmoOneTimePaymentSession({
        onApprove() {
            return Promise.resolve();
        },
    });
}
