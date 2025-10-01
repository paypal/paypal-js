import { loadCoreSdkScript } from "../../../src/v6";
import type { PayPalV6Namespace } from "../index";

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

    const sdkInstance = await paypal.createInstance({
        clientToken: "fakeValue",
        components: ["paypal-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("paypal")) {
        return;
    }

    const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession({
        onApprove: () => Promise.resolve(),
    });

    const createOrder = () => Promise.resolve({ orderId: "ABC123" });

    const paypalButton = document.querySelector("paypal-button");

    paypalButton?.addEventListener("click", async () => {
        try {
            await paypalPaymentSession.start(
                { presentationMode: "auto" },
                createOrder(),
            );
        } catch (error) {
            console.error(error);
        }
    });
}
