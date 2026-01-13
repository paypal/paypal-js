import { loadCoreSdkScript } from "../../../src/v6";
import type {
    OnApproveDataBillingAgreements,
    OnCancelDataBillingAgreements,
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
        components: ["paypal-legacy-billing-agreements"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("paypal")) {
        return;
    }

    function onApproveCallback({
        billingToken,
        payerId,
    }: OnApproveDataBillingAgreements) {
        console.log({
            billingToken,
            payerId,
        });
        return Promise.resolve();
    }

    function onCancelCallback({ billingToken }: OnCancelDataBillingAgreements) {
        console.log({
            billingToken,
        });
    }

    const paypalPaymentSession =
        sdkInstance.createPayPalBillingAgreementWithoutPurchase({
            onApprove: onApproveCallback,
            onCancel: onCancelCallback,
        });

    const createBillingToken = () =>
        Promise.resolve({ billingToken: "ABC123" });

    const paypalButton = document.querySelector("paypal-button");

    paypalButton?.addEventListener("click", async () => {
        try {
            await paypalPaymentSession.start(
                { presentationMode: "auto" },
                createBillingToken(),
            );
        } catch (error) {
            console.error(error);
        }
    });
}
