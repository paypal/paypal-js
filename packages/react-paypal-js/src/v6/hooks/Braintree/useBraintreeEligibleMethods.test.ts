import React, { useReducer } from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import { render, waitFor } from "@testing-library/react";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import {
  useBraintreeEligibleMethods,
  UseBraintreeEligibleMethodsReturn,
} from "./useBraintreeEligibleMethods";
import {
  BraintreePayPalContext,
  braintreeInitialState,
  braintreeReducer,
} from "../../context/BraintreePayPalContext";
import { BraintreeDispatchContext } from "../../context/BraintreeDispatchContext";
import {
  BRAINTREE_DISPATCH_ACTION,
  INSTANCE_LOADING_STATE,
} from "../../types/ProviderEnums";

import type {
  BraintreeEligibilityResult,
  BraintreeFindEligibleMethodsOptions,
} from "../../types/braintree";
import type {
  BraintreeAction,
  BraintreePayPalState,
} from "../../context/BraintreePayPalContext";
import type { BraintreePayPalCheckoutInstance } from "../../types";

const createMockEligibility = (
  overrides: Partial<BraintreeEligibilityResult> = {},
): BraintreeEligibilityResult => ({
  paypal: true,
  paylater: true,
  credit: false,
  getDetails: jest.fn().mockReturnValue(null),
  ...overrides,
});

type MockCheckoutInstance = Pick<
  BraintreePayPalCheckoutInstance,
  "findEligibleMethods"
>;

const createMockCheckoutInstance = (
  result:
    | BraintreeEligibilityResult
    | Promise<BraintreeEligibilityResult> = createMockEligibility(),
): MockCheckoutInstance => ({
  findEligibleMethods: jest
    .fn()
    .mockReturnValue(
      result instanceof Promise ? result : Promise.resolve(result),
    ),
});

const defaultProps: BraintreeFindEligibleMethodsOptions = {
  amount: "10.00",
  currency: "USD",
  countryCode: "US",
  paymentFlow: "ONE_TIME_PAYMENT",
};

// Wrapper accepts arbitrary props because @testing-library/react-hooks types
// the wrapper to match the hook's initialProps shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TestWrapper = React.ComponentType<any>;

interface ProviderHandle {
  Wrapper: TestWrapper;
  dispatch: (action: BraintreeAction) => void;
}

/**
 * Creates a reducer-backed test provider that exposes the real
 * BraintreeDispatchContext so that dispatched SET_ELIGIBILITY actions actually
 * update the BraintreePayPalContext state observed by the hook.
 *
 * Returns a `dispatch` handle for tests that want to mutate state externally
 * (e.g. swapping the checkout instance).
 */
function makeProvider(
  initialOverrides: Partial<BraintreePayPalState> = {},
): ProviderHandle {
  // `currentDispatch` is rebound on every Wrapper render. The returned
  // `dispatch` forwards to it so callers can destructure `dispatch` from the
  // handle BEFORE the Wrapper has mounted (when the real reducer dispatch is
  // not yet known) and still hit the live dispatch at call time.
  let currentDispatch: (action: BraintreeAction) => void = () => {};

  const Wrapper: TestWrapper = ({ children }) => {
    const [state, dispatch] = useReducer(braintreeReducer, {
      ...braintreeInitialState,
      loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
      isHydrated: true,
      ...initialOverrides,
    });
    currentDispatch = dispatch;
    return React.createElement(
      BraintreeDispatchContext.Provider,
      { value: dispatch },
      React.createElement(
        BraintreePayPalContext.Provider,
        { value: state },
        children,
      ),
    );
  };

  return {
    Wrapper,
    dispatch: (action) => currentDispatch(action),
  };
}

describe("useBraintreeEligibleMethods", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should return isPending=true while provider instance is pending", () => {
      const { Wrapper } = makeProvider({
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
      });

      const { result } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.eligibleMethods).toBeNull();
      expect(result.current.error).toBeNull();
    });

    test("should not crash when no checkout instance is available", () => {
      const { Wrapper } = makeProvider({
        loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
      });

      const { result } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      expect(result.current.eligibleMethods).toBeNull();
    });

    test("should call findEligibleMethods with the supplied options when instance is available", async () => {
      const eligibility = createMockEligibility();
      const checkoutInstance = createMockCheckoutInstance(eligibility);
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { result, waitForNextUpdate } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledWith(
        defaultProps,
      );

      await waitForNextUpdate();

      expect(result.current.eligibleMethods).toBe(eligibility);
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test("should set error and leave eligibility null when findEligibleMethods rejects", async () => {
      const thrownError = new Error("findEligibleMethods failed");
      const checkoutInstance = {
        findEligibleMethods: jest.fn().mockRejectedValue(thrownError),
      };
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { result, waitForNextUpdate } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expectCurrentErrorValue(result.current.error);
      expect(result.current.error).toBe(thrownError);
      expect(result.current.eligibleMethods).toBeNull();
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("refetch behavior", () => {
    test("should refetch when options change", async () => {
      const checkoutInstance = createMockCheckoutInstance();
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(
        ({ amount }) =>
          useBraintreeEligibleMethods({ ...defaultProps, amount }),
        { initialProps: { amount: "10.00" }, wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      rerender({ amount: "20.00" });

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(2);
      expect(checkoutInstance.findEligibleMethods).toHaveBeenLastCalledWith(
        expect.objectContaining({ amount: "20.00" }),
      );

      await waitForNextUpdate();
    });

    test("should not refetch when options are deep-equal but referentially different", async () => {
      const checkoutInstance = createMockCheckoutInstance();
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(
        (props: BraintreeFindEligibleMethodsOptions) =>
          useBraintreeEligibleMethods(props),
        { initialProps: { ...defaultProps }, wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      // New reference, same values
      rerender({ ...defaultProps });

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
    });

    test("should refetch when checkout instance changes", async () => {
      const firstInstance = createMockCheckoutInstance();
      const { Wrapper, dispatch } = makeProvider({
        braintreePayPalCheckoutInstance:
          firstInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { waitForNextUpdate } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expect(firstInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      const secondInstance = createMockCheckoutInstance();
      await act(async () => {
        dispatch({
          type: BRAINTREE_DISPATCH_ACTION.SET_INSTANCE,
          value: secondInstance as unknown as BraintreePayPalCheckoutInstance,
        });
      });

      expect(secondInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
    });

    test("should retry with new options after a failure (transient errors must recover)", async () => {
      const successResult = createMockEligibility();
      const checkoutInstance = {
        findEligibleMethods: jest
          .fn()
          .mockRejectedValueOnce(new Error("network blip"))
          .mockResolvedValueOnce(successResult),
      };
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { result, rerender, waitForNextUpdate } = renderHook(
        ({ amount }) =>
          useBraintreeEligibleMethods({ ...defaultProps, amount }),
        { initialProps: { amount: "10.00" }, wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
      expect(result.current.error).not.toBeNull();
      expect(result.current.eligibleMethods).toBeNull();

      // Consumer corrects an option on the SAME (now-failed) instance.
      // The hook must retry rather than stay pinned to the prior failure.
      rerender({ amount: "20.00" });

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(2);
      expect(checkoutInstance.findEligibleMethods).toHaveBeenLastCalledWith(
        expect.objectContaining({ amount: "20.00" }),
      );
      expect(result.current.eligibleMethods).toBe(successResult);
      expect(result.current.error).toBeNull();
    });

    test("should not retry on the same failed checkout instance", async () => {
      const checkoutInstance = {
        findEligibleMethods: jest
          .fn()
          .mockRejectedValue(new Error("init failure")),
      };
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      checkoutInstance.findEligibleMethods.mockClear();
      rerender();

      expect(checkoutInstance.findEligibleMethods).not.toHaveBeenCalled();
    });
  });

  describe("context caching", () => {
    test("should reuse cached eligibility for a second hook mount with the same options", async () => {
      const eligibility = createMockEligibility();
      const checkoutInstance = createMockCheckoutInstance(eligibility);
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      // Each renderHook() call mounts an independent React tree, so the two
      // consumers cannot share context via separate renderHook invocations.
      // To exercise the cross-mount cache contract, render both consumers as
      // siblings under one Wrapper instance and capture their hook returns
      // through component refs.
      const firstReturn: {
        current: UseBraintreeEligibleMethodsReturn | null;
      } = { current: null };
      const secondReturn: {
        current: UseBraintreeEligibleMethodsReturn | null;
      } = { current: null };

      function First() {
        firstReturn.current = useBraintreeEligibleMethods(defaultProps);
        return null;
      }
      function Second() {
        secondReturn.current = useBraintreeEligibleMethods(defaultProps);
        return null;
      }

      const { rerender } = render(
        React.createElement(Wrapper, null, React.createElement(First)),
      );

      await waitFor(() =>
        expect(firstReturn.current?.eligibleMethods).toBe(eligibility),
      );
      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      // Mount a second consumer with the same options under the same provider.
      // The cached eligibility on context should be returned immediately and no
      // additional findEligibleMethods call should fire.
      rerender(
        React.createElement(
          Wrapper,
          null,
          React.createElement(First),
          React.createElement(Second),
        ),
      );

      // Hook is brand-new — its lastFetchRef is null — but a deep-equal payload
      // is already cached on context, so it should still skip the network call.
      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
      expect(secondReturn.current?.eligibleMethods).toBe(eligibility);
    });
  });

  describe("unmount", () => {
    test("should not update state after unmount", async () => {
      let resolveFetch: (value: BraintreeEligibilityResult) => void = () => {};
      const pending = new Promise<BraintreeEligibilityResult>((resolve) => {
        resolveFetch = resolve;
      });

      const checkoutInstance = {
        findEligibleMethods: jest.fn().mockReturnValue(pending),
      };
      const { Wrapper } = makeProvider({
        braintreePayPalCheckoutInstance:
          checkoutInstance as unknown as BraintreePayPalCheckoutInstance,
      });

      const { result, unmount } = renderHook(
        () => useBraintreeEligibleMethods(defaultProps),
        { wrapper: Wrapper },
      );

      unmount();

      await act(async () => {
        resolveFetch(createMockEligibility());
        await pending;
      });

      // Eligibility should remain null because the post-unmount update was skipped
      expect(result.current.eligibleMethods).toBeNull();
    });
  });
});
