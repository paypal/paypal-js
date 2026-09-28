import "@testing-library/jest-dom";
import React from "react";
import { act, render, waitFor } from "@testing-library/react";

import { PayPalProvider } from "./PayPalProvider";
import { usePayPal } from "../hooks/usePayPal";
import { INSTANCE_LOADING_STATE } from "../types/ProviderEnums";

import type { PayPalState } from "../context/PayPalProviderContext";

const TEST_CLIENT_TOKEN = "test-client-token";

/**
 * Unlike PayPalProvider.test.tsx, this file does NOT mock
 * @paypal/paypal-js/sdk-v6 -- it exercises the real, built loadCoreSdkScript
 * (see jest.config's moduleNameMapper) so we can verify the actual <script>
 * tag injected into the page, matching how packages/paypal-js/src/v6/index.test.ts
 * verifies the same thing on the paypal-js side.
 */
describe("PayPalProvider prototype pollution hardening (real loadCoreSdkScript)", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let scriptAppendChildSpy: any;

  beforeEach(() => {
    document.head.innerHTML = "";

    scriptAppendChildSpy = jest
      .spyOn(document.head, "appendChild")
      .mockImplementation((node) => {
        if (node instanceof HTMLScriptElement) {
          const namespace = node.getAttribute("data-namespace") ?? "paypal";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any)[namespace] = {
            version: "6",
            createInstance: jest.fn().mockResolvedValue({
              findEligibleMethods: jest.fn(),
              hydrateEligibleMethods: jest.fn(),
              createPayPalOneTimePaymentSession: jest.fn(),
              updateLocale: jest.fn(),
            }),
          };
          process.nextTick(() => node.dispatchEvent(new Event("load")));
        }
        return node;
      });
  });

  afterEach(() => {
    scriptAppendChildSpy.mockRestore();
    delete (Object.prototype as Record<string, unknown>).dataNamespace;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).paypal;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).evilNs;
    document.head.innerHTML = "";
  });

  function TestComponent() {
    usePayPal();
    return null;
  }

  test("injects the script under the default namespace instead of a prototype-polluted one", async () => {
    (Object.prototype as Record<string, unknown>).dataNamespace = "evilNs";

    await act(async () => {
      render(
        <PayPalProvider clientToken={TEST_CLIENT_TOKEN} environment="sandbox">
          <TestComponent />
        </PayPalProvider>,
      );
    });

    await waitFor(() => expect(scriptAppendChildSpy).toHaveBeenCalledTimes(1));

    const scriptElement = scriptAppendChildSpy.mock.calls[0][0];
    expect(scriptElement.getAttribute("data-namespace")).toBeNull();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).evilNs).toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await waitFor(() => expect((window as any).paypal).toBeDefined());
  });

  it("state ends up resolved against the real (unpolluted) window.paypal namespace", async () => {
    (Object.prototype as Record<string, unknown>).dataNamespace = "evilNs";
    const state: Partial<PayPalState> = {};

    function StateCapturingComponent() {
      const instanceState = usePayPal();
      Object.assign(state, instanceState);
      return null;
    }

    await act(async () => {
      render(
        <PayPalProvider clientToken={TEST_CLIENT_TOKEN} environment="sandbox">
          <StateCapturingComponent />
        </PayPalProvider>,
      );
    });

    await waitFor(() =>
      expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED),
    );
    expect(state.error).toBe(null);
  });
});
