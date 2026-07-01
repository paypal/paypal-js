import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "../useErrorTestUtil";
import { useBraintreePayPalMessages } from "./useBraintreePayPalMessages";
import { useBraintreePayPal } from "./useBraintreePayPal";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type {
  BraintreeMessagesInstance,
  BraintreeMessageContent,
} from "../../types/braintree";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";

jest.mock("./useBraintreePayPal");

const mockUseBraintreePayPal = useBraintreePayPal as jest.MockedFunction<
  typeof useBraintreePayPal
>;

const createMockContent = (): BraintreeMessageContent => ({
  update: jest.fn(),
  content: "<div>Mock PayPal Messages content</div>",
});

const createMockMessagesInstance = (
  content: BraintreeMessageContent = createMockContent(),
): BraintreeMessagesInstance => ({
  fetchContent: jest.fn().mockResolvedValue(content),
});

const createMockCheckoutInstance = (
  messagesInstance: BraintreeMessagesInstance,
) => ({
  createMessages: jest.fn().mockResolvedValue(messagesInstance),
});

describe("useBraintreePayPalMessages", () => {
  let mockContent: BraintreeMessageContent;
  let mockMessagesInstance: BraintreeMessagesInstance;
  let mockCheckoutInstance: ReturnType<typeof createMockCheckoutInstance>;

  const setContext = (overrides: Partial<BraintreePayPalState> = {}) => {
    mockUseBraintreePayPal.mockReturnValue({
      braintreePayPalCheckoutInstance: mockCheckoutInstance,
      eligiblePaymentMethods: null,
      eligiblePaymentMethodsPayload: null,
      loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
      error: null,
      isHydrated: true,
      ...overrides,
    } as unknown as BraintreePayPalState);
  };

  beforeEach(() => {
    mockContent = createMockContent();
    mockMessagesInstance = createMockMessagesInstance(mockContent);
    mockCheckoutInstance = createMockCheckoutInstance(mockMessagesInstance);
    setContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    test("should error if there is no instance and loading is not pending", () => {
      setContext({
        braintreePayPalCheckoutInstance: null,
        loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
      });

      const {
        result: {
          current: { error },
        },
      } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree PayPal Messages instance not available"),
      );
    });

    test("should not error while the instance is still pending", () => {
      setContext({
        braintreePayPalCheckoutInstance: null,
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
      });

      const { result } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isReady).toBe(false);
    });

    test("should create a messages instance with the given options", async () => {
      const { result, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      expect(mockCheckoutInstance.createMessages).toHaveBeenCalledWith({
        buyerCountry: "US",
        currencyCode: "USD",
      });

      // Async creation: loading until the Promise resolves.
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isReady).toBe(false);

      await waitFor(() => expect(result.current.isReady).toBe(true));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("instance lifecycle", () => {
    test("should recreate the instance when buyerCountry changes", async () => {
      const { result, rerender, waitFor } = renderHook(
        ({ buyerCountry }) =>
          useBraintreePayPalMessages({ buyerCountry, currencyCode: "USD" }),
        { initialProps: { buyerCountry: "US" } },
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      mockCheckoutInstance.createMessages.mockClear();

      rerender({ buyerCountry: "GB" });

      expect(mockCheckoutInstance.createMessages).toHaveBeenCalledWith({
        buyerCountry: "GB",
        currencyCode: "USD",
      });

      await waitFor(() => expect(result.current.isReady).toBe(true));
    });

    test("should recreate the instance when currencyCode changes", async () => {
      const { result, rerender, waitFor } = renderHook(
        ({ currencyCode }) =>
          useBraintreePayPalMessages({ buyerCountry: "US", currencyCode }),
        { initialProps: { currencyCode: "USD" } },
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      mockCheckoutInstance.createMessages.mockClear();

      rerender({ currencyCode: "EUR" });

      expect(mockCheckoutInstance.createMessages).toHaveBeenCalledWith({
        buyerCountry: "US",
        currencyCode: "EUR",
      });

      await waitFor(() => expect(result.current.isReady).toBe(true));
    });

    test("should set an error and not retry when creation rejects", async () => {
      const rejectingInstance = {
        createMessages: jest.fn().mockRejectedValue(new Error("boom")),
      };
      setContext({
        braintreePayPalCheckoutInstance:
          rejectingInstance as unknown as BraintreePayPalState["braintreePayPalCheckoutInstance"],
      });

      const { result, rerender, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await waitFor(() => expect(result.current.error).not.toBeNull());

      expect(result.current.error).toEqual(new Error("boom"));
      expect(result.current.isReady).toBe(false);

      rerender();

      expect(rejectingInstance.createMessages).toHaveBeenCalledTimes(1);
    });
  });

  describe("handleFetchContent", () => {
    test("should fetch content and return the content object", async () => {
      const { result, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      let content: BraintreeMessageContent | void = undefined;

      await act(async () => {
        content = await result.current.handleFetchContent({ amount: "100" });
      });

      expect(mockMessagesInstance.fetchContent).toHaveBeenCalledWith({
        amount: "100",
      });
      expect(content).toBe(mockContent);
    });

    test("should return undefined when component is unmounted", async () => {
      const { result, unmount, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      unmount();

      let content: BraintreeMessageContent | void = undefined;

      await act(async () => {
        content = await result.current.handleFetchContent({ amount: "100" });
      });

      expect(content).toBeUndefined();
      expect(mockMessagesInstance.fetchContent).not.toHaveBeenCalled();
    });

    test("should set an error when the messages instance is not available", async () => {
      setContext({
        braintreePayPalCheckoutInstance: null,
        loadingStatus: INSTANCE_LOADING_STATE.PENDING,
      });

      const { result } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await act(async () => {
        await result.current.handleFetchContent({ amount: "100" });
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Braintree PayPal Messages instance not available"),
      );
    });

    test("should set an error but still return content when fetchContent returns the empty sentinel", async () => {
      const emptyContent = {
        messageItems: { mainItems: [], actionItems: [] },
        update: jest.fn(),
      } as unknown as BraintreeMessageContent;
      (mockMessagesInstance.fetchContent as jest.Mock).mockResolvedValue(
        emptyContent,
      );

      const { result, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      let content: BraintreeMessageContent | void = undefined;

      await act(async () => {
        content = await result.current.handleFetchContent({ amount: "100" });
      });

      const { error } = result.current;

      expectCurrentErrorValue(error);

      expect(error).toEqual(
        new Error("Failed to fetch PayPal Messages content"),
      );
      // Content is still returned so setContent() lets the element collapse.
      expect(content).toBe(emptyContent);
    });

    test("should not error when fetchContent returns populated messageItems", async () => {
      (mockMessagesInstance.fetchContent as jest.Mock).mockResolvedValue({
        messageItems: { mainItems: [{ type: "text" }], actionItems: [] },
        update: jest.fn(),
      });

      const { result, waitFor } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      await waitFor(() => expect(result.current.isReady).toBe(true));

      await act(async () => {
        await result.current.handleFetchContent({ amount: "100" });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("context error", () => {
    test("should surface the provider error separately and labeled", () => {
      setContext({
        braintreePayPalCheckoutInstance: null,
        error: new Error("init failed"),
      });

      const { result } = renderHook(() =>
        useBraintreePayPalMessages({ buyerCountry: "US", currencyCode: "USD" }),
      );

      expect(result.current.error).toEqual(
        new Error("Braintree PayPal context error: Error: init failed"),
      );
      expect(result.current.isReady).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
