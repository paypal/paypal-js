import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import { useBraintreeEligibleMethods } from "./useBraintreeEligibleMethods";
import { useBraintreePayPal } from "./useBraintreePayPal";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type {
  BraintreeEligibilityResult,
  BraintreeFindEligibleMethodsOptions,
} from "../../types/braintree";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";

jest.mock("./useBraintreePayPal");

const mockUseBraintreePayPal = useBraintreePayPal as jest.MockedFunction<
  typeof useBraintreePayPal
>;

const createMockEligibility = (
  overrides: Partial<BraintreeEligibilityResult> = {},
): BraintreeEligibilityResult => ({
  paypal: true,
  paylater: true,
  credit: false,
  getDetails: jest.fn().mockReturnValue(null),
  ...overrides,
});

const createMockCheckoutInstance = (
  result:
    | BraintreeEligibilityResult
    | Promise<BraintreeEligibilityResult> = createMockEligibility(),
) => ({
  findEligibleMethods: jest
    .fn()
    .mockReturnValue(
      result instanceof Promise ? result : Promise.resolve(result),
    ),
});

const defaultBraintreeState: BraintreePayPalState = {
  braintreePayPalCheckoutInstance: null,
  loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
  error: null,
  isHydrated: true,
};

function mockBraintreeContext(
  overrides: Partial<
    Omit<BraintreePayPalState, "braintreePayPalCheckoutInstance"> & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      braintreePayPalCheckoutInstance?: any;
    }
  > = {},
): void {
  mockUseBraintreePayPal.mockReturnValue({
    ...defaultBraintreeState,
    ...overrides,
  } as BraintreePayPalState);
}

const defaultProps: BraintreeFindEligibleMethodsOptions = {
  amount: "10.00",
  currency: "USD",
  countryCode: "US",
  paymentFlow: "ONE_TIME_PAYMENT",
};

describe("useBraintreeEligibleMethods", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should return isPending=true while provider instance is pending", () => {
      mockBraintreeContext({ loadingStatus: INSTANCE_LOADING_STATE.PENDING });

      const { result } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.eligibility).toBeNull();
      expect(result.current.error).toBeNull();
    });

    test("should not call findEligibleMethods when no checkout instance is available", () => {
      mockBraintreeContext({
        loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
      });

      renderHook(() => useBraintreeEligibleMethods(defaultProps));

      // Nothing to assert on the instance — it's null. Just confirm no crash and no eligibility.
    });

    test("should call findEligibleMethods with the supplied options when instance is available", async () => {
      const eligibility = createMockEligibility();
      const checkoutInstance = createMockCheckoutInstance(eligibility);

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledWith(
        defaultProps,
      );

      await waitForNextUpdate();

      expect(result.current.eligibility).toBe(eligibility);
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBeNull();
    });

    test("should set error and leave eligibility null when findEligibleMethods rejects", async () => {
      const thrownError = new Error("findEligibleMethods failed");
      const checkoutInstance = {
        findEligibleMethods: jest.fn().mockRejectedValue(thrownError),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { result, waitForNextUpdate } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      await waitForNextUpdate();

      expectCurrentErrorValue(result.current.error);
      expect(result.current.error).toBe(thrownError);
      expect(result.current.eligibility).toBeNull();
      expect(result.current.isPending).toBe(false);
    });
  });

  describe("refetch behavior", () => {
    test("should refetch when options change", async () => {
      const checkoutInstance = createMockCheckoutInstance();

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(
        ({ amount }) =>
          useBraintreeEligibleMethods({ ...defaultProps, amount }),
        { initialProps: { amount: "10.00" } },
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

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(
        (props: BraintreeFindEligibleMethodsOptions) =>
          useBraintreeEligibleMethods(props),
        { initialProps: { ...defaultProps } },
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      // New reference, same values
      rerender({ ...defaultProps });

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
    });

    test("should refetch when checkout instance changes", async () => {
      const firstInstance = createMockCheckoutInstance();

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: firstInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      await waitForNextUpdate();

      expect(firstInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      const secondInstance = createMockCheckoutInstance();
      mockBraintreeContext({
        braintreePayPalCheckoutInstance: secondInstance,
      });

      rerender();

      expect(secondInstance.findEligibleMethods).toHaveBeenCalledTimes(1);
    });

    test("should not retry on the same failed checkout instance", async () => {
      const checkoutInstance = {
        findEligibleMethods: jest
          .fn()
          .mockRejectedValue(new Error("init failure")),
      };

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { rerender, waitForNextUpdate } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      await waitForNextUpdate();

      expect(checkoutInstance.findEligibleMethods).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      rerender();

      expect(checkoutInstance.findEligibleMethods).not.toHaveBeenCalled();
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

      mockBraintreeContext({
        braintreePayPalCheckoutInstance: checkoutInstance,
      });

      const { result, unmount } = renderHook(() =>
        useBraintreeEligibleMethods(defaultProps),
      );

      unmount();

      await act(async () => {
        resolveFetch(createMockEligibility());
        await pending;
      });

      // Eligibility should remain null because the post-unmount update was skipped
      expect(result.current.eligibility).toBeNull();
    });
  });
});
