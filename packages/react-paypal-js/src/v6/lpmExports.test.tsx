import React from "react";
import { render } from "@testing-library/react";

import {
  IdealOneTimePaymentButton,
  BancontactOneTimePaymentButton,
  EpsOneTimePaymentButton,
} from "./lpmExports";

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

// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  useLPMOneTimePaymentSession,
} = require("./hooks/useLPMOneTimePaymentSession");

describe("Factory-generated LPM exports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLPMOneTimePaymentSession.mockReturnValue({
      error: null,
      isPending: false,
      handleClick: jest.fn(),
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
