import { loadScript } from "../../src/index";
import type { PayPalNamespace } from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
  // @ts-expect-error - Property '"client-id"' is missing in type '{}' but required in type 'PayPalScriptOptions'
  loadScript({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadScriptPromise: Promise<PayPalNamespace | null> = loadScript({
    clientId: "test",
  });

  let paypal: PayPalNamespace | null;

  try {
    paypal = await loadScript({
      clientId: "test",
      currency: "USD",
      dataPageType: "checkout",
      disableFunding: "card",
    });
  } catch (err) {
    throw new Error(`Failed to load the paypal sdk script: ${err}`);
  }

  paypal?.Buttons?.();

  // you can also use window.paypal
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paypalFromWindow = (window as any).paypal as PayPalNamespace;
  paypalFromWindow.Buttons?.();
}
