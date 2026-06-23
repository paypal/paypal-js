import React from "react";
import { render } from "@testing-library/react";

import { usePayPalGuestPaymentSession } from "./usePayPalGuestPaymentSession";
import { mockPayPalContext } from "./usePayPalTestUtils";
import { useProxyProps } from "../utils";

import type { UsePayPalGuestPaymentSessionProps } from "./usePayPalGuestPaymentSession";

jest.mock("./usePayPal");
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  useProxyProps: jest.fn(),
}));

const mockUseProxyProps = useProxyProps as jest.MockedFunction<
  typeof useProxyProps
>;

type BasicCardEl = HTMLElement & { buyerCountry?: string };

/**
 * Mirrors the "hook + web component" integration: the consumer attaches the hook's `buttonRef`
 * to a real `<paypal-basic-card-button>`. We use createElement for the custom tags so the test
 * does not depend on the JSX intrinsic augmentation.
 */
function Harness(props: UsePayPalGuestPaymentSessionProps) {
  const { buttonRef } = usePayPalGuestPaymentSession(props);
  return React.createElement(
    "paypal-basic-card-container",
    null,
    React.createElement("paypal-basic-card-button", { ref: buttonRef }),
  );
}

describe("usePayPalGuestPaymentSession - buyerCountry", () => {
  beforeEach(() => {
    mockUseProxyProps.mockImplementation((callbacks) => callbacks);
    mockPayPalContext({
      sdkInstance: {
        createPayPalGuestOneTimePaymentSession: jest.fn().mockReturnValue({
          start: jest.fn().mockResolvedValue(undefined),
          cancel: jest.fn(),
          destroy: jest.fn(),
        }),
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("applies buyerCountry to the target element via the DOM property (works on all React versions)", () => {
    const { container } = render(
      <Harness orderId="order-1" onApprove={jest.fn()} buyerCountry="US" />,
    );

    const el = container.querySelector<BasicCardEl>("paypal-basic-card-button");
    expect(el).not.toBeNull();
    expect(el?.buyerCountry).toBe("US");
  });

  test("does not set buyerCountry when it is omitted", () => {
    const { container } = render(
      <Harness orderId="order-1" onApprove={jest.fn()} />,
    );

    const el = container.querySelector<BasicCardEl>("paypal-basic-card-button");
    expect(el).not.toBeNull();
    expect(el?.buyerCountry).toBeUndefined();
  });
});
