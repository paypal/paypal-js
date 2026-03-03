import { loadCoreSdkScript } from "../../../src/v6";
import type { OnApproveDataSubscriptions, PayPalV6Namespace } from "../index";

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
        components: ["paypal-subscriptions"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("paypal")) {
        return;
    }

    function onApproveCallback({
        subscriptionId,
        payerId,
    }: OnApproveDataSubscriptions) {
        console.log({
            subscriptionId,
            payerId,
        });
        return Promise.resolve();
    }

    const paypalSubscriptionsPaymentSession =
        sdkInstance.createPayPalSubscriptionPaymentSession({
            onApprove: onApproveCallback,
        });

    const createSubscription = () =>
        Promise.resolve({ subscriptionId: "ABC123" });

    const paypalButton = document.querySelector("paypal-button");

    paypalButton?.addEventListener("click", async () => {
        try {
            await paypalSubscriptionsPaymentSession.start(
                { presentationMode: "auto" },
                createSubscription(),
            );
        } catch (error) {
            console.error(error);
        }
    });
}
