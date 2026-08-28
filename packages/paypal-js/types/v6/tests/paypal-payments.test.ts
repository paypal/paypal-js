import { loadCoreSdkScript } from "../../../src/v6";
import type {
  OnApproveDataOneTimePayments,
  OnCancelDataOneTimePayments,
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
    components: ["paypal-payments"],
  });

  const paymentMethods = await sdkInstance.findEligibleMethods({
    currencyCode: "USD",
  });

  if (!paymentMethods.isEligible("paypal")) {
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

  function onCancelCallback({ orderId }: OnCancelDataOneTimePayments) {
    console.log({
      orderId,
    });
  }

  const paypalPaymentSession = sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: onApproveCallback,
    onCancel: onCancelCallback,
    commit: true,
  });

  // Regression guard for https://github.com/paypal/paypal-js/issues/1020:
  // `onApprove` is OPTIONAL for one-time PayPal payment sessions (and its
  // Pay Later / Credit aliases). The presentation mode is only chosen later at
  // `.start()`, and redirect flows legitimately omit `onApprove`, so core cannot
  // require it. It is re-added as optional via `Omit<BasePaymentSessionOptions,
  // "onApprove">` (mirroring `SavePaymentSessionOptions`), so an empty options
  // object must type-check.
  sdkInstance.createPayPalOneTimePaymentSession({});
  sdkInstance.createPayLaterOneTimePaymentSession({});
  sdkInstance.createPayPalCreditOneTimePaymentSession({});

  // When supplied, `onApprove` is still type-checked.
  sdkInstance.createPayPalOneTimePaymentSession({
    onApprove: onApproveCallback,
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
