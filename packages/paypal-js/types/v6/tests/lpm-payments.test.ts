import { loadCoreSdkScript } from "../../../src/v6";
import type {
  LPMOneTimePaymentSession,
  LPMPaymentsInstance,
  LPMStartOptions,
  LPMSessionFields,
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

  const sdkInstance = await paypal.createInstance({
    clientToken: "fakeValue",
    components: ["ideal-payments"],
  });

  const idealSession: LPMOneTimePaymentSession | undefined =
    sdkInstance.createIdealOneTimePaymentSession?.({
      onApprove: async () => undefined,
    });

  if (!idealSession) {
    return;
  }

  // Session fields belong in the promise passed as the 2nd argument to
  // start(), not on the presentation-mode options (1st argument).
  const sessionFields: LPMSessionFields = {
    phone: { countryCode: "31", nationalNumber: "612345678" },
  };
  const startOptions: LPMStartOptions = { presentationMode: "popup" };

  await idealSession.start(
    startOptions,
    Promise.resolve({ orderId: "ORDER-123", ...sessionFields }),
  );

  // LPM sessions do not support "auto" presentation mode.
  // @ts-expect-error "auto" is not a valid LPM presentation mode
  await idealSession.start({ presentationMode: "auto" });

  // Session fields must not be passed as part of the start() options.
  await idealSession.start({
    presentationMode: "popup",
    // @ts-expect-error phone belongs on the paymentSessionPromise, not start options
    phone: sessionFields.phone,
  });

  // Verify LPMPaymentsInstance narrowing from SdkInstance
  const instance: LPMPaymentsInstance = sdkInstance;
  instance.createIdealOneTimePaymentSession?.({
    onApprove: async () => undefined,
  });
}
