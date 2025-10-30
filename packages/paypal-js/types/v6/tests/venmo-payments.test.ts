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
        components: ["venmo-payments"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("venmo")) {
        return;
    }

    function onApproveCallback({
        orderId,
        payerId,
    }: OnApproveDataOneTimePayments) {
        console.log({
            orderId,
            payerId,
        });
        return Promise.resolve();
    }

    const venmoPaymentSession = sdkInstance.createVenmoOneTimePaymentSession({
        onApprove: onApproveCallback,
    });

    const createOrder = () => Promise.resolve({ orderId: "ABC123" });

    const venmoButton = document.querySelector("venmo-button");

    venmoButton?.addEventListener("click", async () => {
        try {
            await venmoPaymentSession.start(
                { presentationMode: "auto" },
                createOrder(),
            );
        } catch (error) {
            console.error(error);
        }
    });
}
