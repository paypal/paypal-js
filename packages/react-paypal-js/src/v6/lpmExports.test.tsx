import React from "react";
import { render } from "@testing-library/react";

import {
  IdealOneTimePaymentButton,
  BancontactOneTimePaymentButton,
  EpsOneTimePaymentButton,
  useIdealOneTimePaymentSession,
  useEpsOneTimePaymentSession,
} from "./lpmExports";
import {
  IdealPaymentButton,
  EpsPaymentButton,
} from "./lpmExports";
import { useLPMOneTimePaymentSession } from "./hooks/useLPMOneTimePaymentSession";

jest.mock("./hooks/useLPMOneTimePaymentSession", () => ({
  useLPMOneTimePaymentSession: jest.fn().mockReturnValue({
    error: null,
    isPending: false,
    handleClick: jest.fn(),
  }),
}));
jest.mock("./hooks/usePayPal", () => ({
  usePayPal: jest.fn().mockReturnValue({ isHydrated: true }),
}));

const mockedUseLPM = jest.mocked(useLPMOneTimePaymentSession);

describe("Factory-generated LPM exports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLPM.mockReturnValue({
      error: null,
      isPending: false,
      session: null,
      handleClick: jest.fn(),
      handleCancel: jest.fn(),
      handleDestroy: jest.fn(),
      Button: () => null,
    });
  });

  test("IdealOneTimePaymentButton passes lpm='ideal'", () => {
    render(
      <IdealOneTimePaymentButton
        presentationMode="auto"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "ideal" }),
    );
  });

  test("BancontactOneTimePaymentButton passes lpm='bancontact'", () => {
    render(
      <BancontactOneTimePaymentButton
        presentationMode="auto"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "bancontact" }),
    );
  });

  test("EpsOneTimePaymentButton passes lpm='eps'", () => {
    render(
      <EpsOneTimePaymentButton
        presentationMode="auto"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "eps" }),
    );
  });

  test("factory components have correct displayName", () => {
    expect(IdealOneTimePaymentButton.displayName).toBe(
      "iDEALOneTimePaymentButton",
    );
    expect(BancontactOneTimePaymentButton.displayName).toBe(
      "BancontactOneTimePaymentButton",
    );
    expect(EpsOneTimePaymentButton.displayName).toBe(
      "EPSOneTimePaymentButton",
    );
  });
});

// ─── Enhanced hooks — field components returned by hook ──────────────────────

// Helper: capture a hook's return value synchronously by rendering a probe component.
function captureHookResult<T>(hookFn: () => T): T {
  const captured: { current: T | null } = { current: null };

  function Probe() {
    captured.current = hookFn();
    return null;
  }

  render(<Probe />);
  return captured.current as T;
}

describe("Enhanced LPM hooks — field components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLPM.mockReturnValue({
      error: null,
      isPending: false,
      session: null,
      handleClick: jest.fn(),
      handleCancel: jest.fn(),
      handleDestroy: jest.fn(),
      Button: () => null,
    });
  });

  test("useIdealOneTimePaymentSession returns a NameField component", () => {
    const result = captureHookResult(() =>
      useIdealOneTimePaymentSession({
        presentationMode: "popup",
        createOrder: jest.fn().mockResolvedValue({ orderId: "test" }),
        onApprove: jest.fn().mockResolvedValue(undefined),
      }),
    );

    expect(typeof result.NameField).toBe("function");
    expect((result.NameField as unknown as React.FC).displayName).toBe("NameField");
  });

  test("useEpsOneTimePaymentSession returns a NameField component (eps has fields: ['name'])", () => {
    const result = captureHookResult(() =>
      useEpsOneTimePaymentSession({
        presentationMode: "popup",
        createOrder: jest.fn().mockResolvedValue({ orderId: "test" }),
        onApprove: jest.fn().mockResolvedValue(undefined),
      }),
    );

    expect(typeof result.NameField).toBe("function");
  });

  test("NameField renders a div container", () => {
    const result = captureHookResult(() =>
      useIdealOneTimePaymentSession({
        presentationMode: "popup",
        createOrder: jest.fn().mockResolvedValue({ orderId: "test" }),
        onApprove: jest.fn().mockResolvedValue(undefined),
      }),
    );

    const NameField = result.NameField as React.FC<{ containerStyles?: React.CSSProperties }>;
    const { container } = render(<NameField containerStyles={{ marginBottom: 8 }} />);
    expect(container.querySelector("div")).not.toBeNull();
  });
});

// ─── Standalone named button components ──────────────────────────────────────

describe("Standalone LPM payment buttons (lpmProviderExports)", () => {
  test("IdealPaymentButton has correct displayName", () => {
    expect(IdealPaymentButton.displayName).toBe("IdealPaymentButton");
  });

  test("EpsPaymentButton has correct displayName", () => {
    expect(EpsPaymentButton.displayName).toBe("EpsPaymentButton");
  });

  test("IdealPaymentButton renders the ideal-button web component", () => {
    const mockSession = {
      handleClick: jest.fn(),
      isPending: false,
      error: null,
    };

    const { container } = render(
      <IdealPaymentButton paymentSession={mockSession} />,
    );

    expect(container.querySelector("ideal-button")).not.toBeNull();
  });

  test("IdealPaymentButton is disabled when isPending=true", () => {
    const mockSession = {
      handleClick: jest.fn(),
      isPending: true,
      error: null,
    };

    const { container } = render(
      <IdealPaymentButton paymentSession={mockSession} />,
    );

    expect(container.querySelector("ideal-button")?.getAttribute("disabled")).not.toBeNull();
  });

  test("IdealPaymentButton is disabled when error is present", () => {
    const mockSession = {
      handleClick: jest.fn(),
      isPending: false,
      error: new Error("Something went wrong"),
    };

    const { container } = render(
      <IdealPaymentButton paymentSession={mockSession} />,
    );

    expect(container.querySelector("ideal-button")?.getAttribute("disabled")).not.toBeNull();
  });
});
