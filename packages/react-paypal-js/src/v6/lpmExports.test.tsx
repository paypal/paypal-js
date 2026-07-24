import React from "react";
import { render, act } from "@testing-library/react";

import {
  IdealOneTimePaymentButton,
  BancontactOneTimePaymentButton,
  EpsOneTimePaymentButton,
  KlarnaOneTimePaymentButton,
  FiuuOneTimePaymentButton,
  useIdealOneTimePaymentSession,
  useEpsOneTimePaymentSession,
} from "./lpmExports";
import {
  IdealPaymentButton,
  EpsPaymentButton,
  FiuuPaymentButton,
  LPMSessionHandleContext,
} from "./lpmExports";
import { useLPMOneTimePaymentSession } from "./hooks/useLPMOneTimePaymentSession";

import type { LPMOneTimePaymentSession } from "./types";

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

function makeDefaultMockReturn(session: LPMOneTimePaymentSession | null = null) {
  return {
    error: null,
    isPending: false,
    session,
    handleClick: jest.fn(),
    handleCancel: jest.fn(),
    handleDestroy: jest.fn(),
    handleValidate: jest.fn().mockResolvedValue(true),
  };
}

describe("Factory-generated LPM exports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseLPM.mockReturnValue(makeDefaultMockReturn());
  });

  test("IdealOneTimePaymentButton passes lpm='ideal'", () => {
    render(
      <IdealOneTimePaymentButton
        presentationMode="popup"
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
        presentationMode="popup"
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
        presentationMode="popup"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "eps" }),
    );
  });

  test("KlarnaOneTimePaymentButton passes lpm='klarna'", () => {
    render(
      <KlarnaOneTimePaymentButton
        presentationMode="popup"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "klarna" }),
    );
  });

  test("FiuuOneTimePaymentButton passes lpm='fiuu'", () => {
    render(
      <FiuuOneTimePaymentButton
        presentationMode="popup"
        orderId="test"
        onApprove={jest.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(useLPMOneTimePaymentSession).toHaveBeenCalledWith(
      expect.objectContaining({ lpm: "fiuu" }),
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
    mockedUseLPM.mockReturnValue(makeDefaultMockReturn());
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

  test("FieldComponent calls createPaymentFields when session becomes available via LPMSessionContext", async () => {
    const makeSession = (): LPMOneTimePaymentSession => ({
      start: jest.fn().mockResolvedValue(undefined),
      cancel: jest.fn(),
      destroy: jest.fn(),
      createPaymentFields: jest.fn().mockReturnValue(document.createElement("div")),
      validate: jest.fn().mockResolvedValue(true),
    });

    const session1 = makeSession();
    let currentSession: LPMOneTimePaymentSession | null = null;

    mockedUseLPM.mockImplementation(() => makeDefaultMockReturn(currentSession));

    // Capture hook result + render NameField wrapped in LPMSessionProvider
    let capturedResult: ReturnType<typeof useIdealOneTimePaymentSession> | null = null;

    function TestTree() {
      capturedResult = useIdealOneTimePaymentSession({
        presentationMode: "popup",
        createOrder: jest.fn().mockResolvedValue({ orderId: "t" }),
        onApprove: jest.fn().mockResolvedValue(undefined),
      });
      if (!capturedResult) return null;
      const { LPMSessionProvider } = capturedResult;
      const NF = capturedResult.NameField as React.FC;
      return (
        <LPMSessionProvider>
          <NF />
        </LPMSessionProvider>
      );
    }

    const { rerender } = render(<TestTree />);

    // No session yet — createPaymentFields not called
    expect(session1.createPaymentFields).not.toHaveBeenCalled();

    // Provide a session
    currentSession = session1;
    await act(async () => {
      rerender(<TestTree />);
    });

    expect(session1.createPaymentFields).toHaveBeenCalledWith({ type: "name" });
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

  test("FiuuPaymentButton renders the fiuu-button web component (non-derived tag)", () => {
    const mockHandle = {
      handleClick: jest.fn(),
      isPending: false,
      error: null,
    };

    const { container } = render(
      <LPMSessionHandleContext.Provider value={mockHandle}>
        <FiuuPaymentButton />
      </LPMSessionHandleContext.Provider>,
    );

    expect(container.querySelector("fiuu-button")).not.toBeNull();
  });

  test("IdealPaymentButton renders the ideal-button web component", () => {
    const mockHandle = {
      handleClick: jest.fn(),
      isPending: false,
      error: null,
    };

    const { container } = render(
      <LPMSessionHandleContext.Provider value={mockHandle}>
        <IdealPaymentButton />
      </LPMSessionHandleContext.Provider>,
    );

    expect(container.querySelector("ideal-button")).not.toBeNull();
  });

  test("IdealPaymentButton is disabled when isPending=true", () => {
    const mockHandle = {
      handleClick: jest.fn(),
      isPending: true,
      error: null,
    };

    const { container } = render(
      <LPMSessionHandleContext.Provider value={mockHandle}>
        <IdealPaymentButton />
      </LPMSessionHandleContext.Provider>,
    );

    expect(container.querySelector("ideal-button")?.getAttribute("disabled")).not.toBeNull();
  });

  test("IdealPaymentButton is disabled when error is present", () => {
    const mockHandle = {
      handleClick: jest.fn(),
      isPending: false,
      error: new Error("Something went wrong"),
    };

    const { container } = render(
      <LPMSessionHandleContext.Provider value={mockHandle}>
        <IdealPaymentButton />
      </LPMSessionHandleContext.Provider>,
    );

    expect(container.querySelector("ideal-button")?.getAttribute("disabled")).not.toBeNull();
  });
});
