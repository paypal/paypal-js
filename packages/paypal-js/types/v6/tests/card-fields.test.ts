import { loadCoreSdkScript } from "../../../src/v6";
import type { PayPalV6Namespace } from "../index";

/**
 * Type test for Card Fields integration
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
        components: ["card-fields"],
    });

    const paymentMethods = await sdkInstance.findEligibleMethods({
        currencyCode: "USD",
    });

    if (!paymentMethods.isEligible("advanced_cards")) {
        return;
    }

    const details = paymentMethods.getDetails("advanced_cards");
    details.supportsInstallments;
    details.cobrandedEnabled;
    details.vendors[0].network;
    details.vendors[0].eligible;
    details.vendors[0].canBeVaulted;
    details.vendors[0].branded;

    const paypalCardFieldsOneTimePaymentSession =
        sdkInstance.createCardFieldsOneTimePaymentSession();
    paypalCardFieldsOneTimePaymentSession.createCardFieldsComponent({
        type: "number",
        placeholder: "Enter a number:",
    });
    paypalCardFieldsOneTimePaymentSession.createCardFieldsComponent({
        type: "cvv",
        placeholder: "Enter CVV:",
    });
    paypalCardFieldsOneTimePaymentSession.createCardFieldsComponent({
        type: "expiry",
        placeholder: "Enter Expiry:",
    });

    const createOrder = () => Promise.resolve({ orderId: "ABC123" });

    const submitButton = document.createElement("button");
    submitButton.addEventListener("click", async () => {
        try {
            const { orderId } = await createOrder();
            await paypalCardFieldsOneTimePaymentSession.submit(orderId);
        } catch (error) {
            console.error(error);
        }
    });
}
