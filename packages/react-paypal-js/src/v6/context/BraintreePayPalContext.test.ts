import { braintreeReducer } from "./BraintreePayPalContext";
import {
  BRAINTREE_DISPATCH_ACTION,
  INSTANCE_LOADING_STATE,
} from "../types/ProviderEnums";

import type {
  BraintreePayPalState,
  BraintreeAction,
} from "./BraintreePayPalContext";
import type { BraintreePayPalCheckoutInstance } from "../types";

function createMockCheckoutInstance(): BraintreePayPalCheckoutInstance {
  return {
    loadPayPalSDK: jest.fn().mockResolvedValue(undefined),
    tokenizePayment: jest.fn().mockResolvedValue({
      nonce: "test-nonce",
      type: "PayPalAccount",
      details: {
        email: "test@example.com",
        payerId: "payer-id",
        firstName: "Test",
        lastName: "User",
      },
    }),
    createOneTimePaymentSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createBillingAgreementSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createCheckoutWithVaultSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createPayLaterSession: jest.fn().mockReturnValue({ start: jest.fn() }),
    createPayment: jest.fn().mockResolvedValue("order-id"),
    findEligibleMethods: jest.fn().mockResolvedValue({
      paypal: true,
      paylater: false,
      credit: false,
      getDetails: jest.fn().mockReturnValue(null),
    }),
    getClientId: jest.fn().mockResolvedValue("client-id"),
    updatePayment: jest.fn().mockResolvedValue(undefined),
    teardown: jest.fn().mockResolvedValue(undefined),
  };
}

function createInitialState(): BraintreePayPalState {
  return {
    braintreePayPalCheckoutInstance: null,
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    error: null,
    isHydrated: false,
  };
}

describe("braintreeReducer", () => {
  let initialState: BraintreePayPalState;

  beforeEach(() => {
    initialState = createInitialState();
  });

  describe("SET_LOADING_STATUS action", () => {
    test.each([
      INSTANCE_LOADING_STATE.PENDING,
      INSTANCE_LOADING_STATE.RESOLVED,
      INSTANCE_LOADING_STATE.REJECTED,
    ])("should set loadingStatus to %s", (status) => {
      const action: BraintreeAction = {
        type: BRAINTREE_DISPATCH_ACTION.SET_LOADING_STATUS,
        value: status,
      };

      const result = braintreeReducer(initialState, action);

      expect(result.loadingStatus).toBe(status);
      expect(result).not.toBe(initialState);
    });
  });

  describe("SET_INSTANCE action", () => {
    test("should set checkout instance and automatically set loadingStatus to RESOLVED", () => {
      const mockInstance = createMockCheckoutInstance();
      const action: BraintreeAction = {
        type: BRAINTREE_DISPATCH_ACTION.SET_INSTANCE,
        value: mockInstance,
      };

      const result = braintreeReducer(initialState, action);

      expect(result.braintreePayPalCheckoutInstance).toBe(mockInstance);
      expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
      expect(result).not.toBe(initialState);
    });
  });

  describe("SET_ERROR action", () => {
    test.each([
      ["Error", new Error("Braintree loading failed")],
      ["TypeError", new TypeError("Network error")],
    ])(
      "should set error and automatically set loadingStatus to REJECTED for %s",
      (_name, error) => {
        const action: BraintreeAction = {
          type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
          value: error,
        };

        const result = braintreeReducer(initialState, action);

        expect(result.error).toBe(error);
        expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
        expect(result).not.toBe(initialState);
      },
    );
  });

  describe("RESET_STATE action", () => {
    test("should reset state to initial values", () => {
      const stateWithData: BraintreePayPalState = {
        braintreePayPalCheckoutInstance: createMockCheckoutInstance(),
        error: new Error("previous error"),
        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
        isHydrated: false,
      };

      const action: BraintreeAction = {
        type: BRAINTREE_DISPATCH_ACTION.RESET_STATE,
      };

      const result = braintreeReducer(stateWithData, action);

      expect(result.braintreePayPalCheckoutInstance).toBe(null);
      expect(result.error).toBe(null);
      expect(result.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
      expect(result.isHydrated).toBe(false);
      expect(result).not.toBe(stateWithData);
    });
  });

  describe("Invalid actions", () => {
    test("should return same state for unknown action type", () => {
      const result = braintreeReducer(initialState, {
        // @ts-expect-error invalid action type
        type: "UNKNOWN_ACTION",
        // @ts-expect-error invalid value
        value: "test",
      });

      expect(result).toBe(initialState);
    });
  });

  describe("State immutability and preservation", () => {
    test("should return new state object for all valid actions", () => {
      const testCases: BraintreeAction[] = [
        {
          type: BRAINTREE_DISPATCH_ACTION.SET_LOADING_STATUS,
          value: INSTANCE_LOADING_STATE.PENDING,
        },
        {
          type: BRAINTREE_DISPATCH_ACTION.SET_INSTANCE,
          value: createMockCheckoutInstance(),
        },
        {
          type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
          value: new Error("test"),
        },
        {
          type: BRAINTREE_DISPATCH_ACTION.RESET_STATE,
        },
      ];

      testCases.forEach((action) => {
        const result = braintreeReducer(initialState, action);
        expect(result).not.toBe(initialState);
      });
    });

    test("should preserve unmodified properties", () => {
      const mockInstance = createMockCheckoutInstance();
      const stateWithInstance: BraintreePayPalState = {
        braintreePayPalCheckoutInstance: mockInstance,
        loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
        error: null,
        isHydrated: false,
      };

      const action: BraintreeAction = {
        type: BRAINTREE_DISPATCH_ACTION.SET_ERROR,
        value: new Error("test"),
      };

      const result = braintreeReducer(stateWithInstance, action);

      expect(result.braintreePayPalCheckoutInstance).toBe(mockInstance);
    });
  });
});
