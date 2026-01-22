import { renderHook, act } from "@testing-library/react-hooks";

import { expectCurrentErrorValue } from "./useErrorTestUtil";
import { usePayPalMessages } from "./usePayPalMessages";
import { usePayPal } from "./usePayPal";
import { INSTANCE_LOADING_STATE } from "../types";

import type {
    PayPalMessagesSession,
    LearnMore,
    FetchContentOptions,
    LearnMoreOptions,
    PayPalMessagesOptions,
} from "../types";

jest.mock("./usePayPal");

const mockUsePayPal = usePayPal as jest.MockedFunction<typeof usePayPal>;

const createMockPayPalMessagesSession = (): PayPalMessagesSession => ({
    fetchContent: jest.fn().mockResolvedValue({
        content: "<div>Mock PayPal Messages content</div>",
        meta: {
            trackingPayload: "mock-tracking-payload",
        },
    }),
    createLearnMore: jest.fn().mockReturnValue({
        isOpen: false,
        open: jest.fn(),
        close: jest.fn(),
        update: jest.fn(),
        show: jest.fn(),
        setupPostMessenger: jest.fn(),
    } as LearnMore),
});

const createMockSdkInstance = (
    messagesSession = createMockPayPalMessagesSession(),
) => ({
    createPayPalMessages: jest.fn().mockReturnValue(messagesSession),
});

describe("usePayPalMessages", () => {
    let mockMessagesSession: PayPalMessagesSession;
    let mockSdkInstance: ReturnType<typeof createMockSdkInstance>;

    beforeEach(() => {
        mockMessagesSession = createMockPayPalMessagesSession();
        mockSdkInstance = createMockSdkInstance(mockMessagesSession);

        mockUsePayPal.mockReturnValue({
            // @ts-expect-error mocking sdk instance
            sdkInstance: mockSdkInstance,
            loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            eligiblePaymentMethods: null,
            error: null,
            isHydrated: true,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("initialization", () => {
        test("should error if there is no sdkInstance when called", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const {
                result: {
                    current: { error },
                },
            } = renderHook(() => usePayPalMessages(props));

            expectCurrentErrorValue(error);

            expect(error).toEqual(new Error("no sdk instance available"));
        });

        test("should create a PayPal Messages session with all options", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
                shopperSessionId: "test-session-id",
            };

            renderHook(() => usePayPalMessages(props));

            expect(mockSdkInstance.createPayPalMessages).toHaveBeenCalledWith({
                buyerCountry: "US",
                currencyCode: "USD",
                shopperSessionId: "test-session-id",
            });
        });

        test("should create a PayPal Messages session without optional shopperSessionId", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            renderHook(() => usePayPalMessages(props));

            expect(mockSdkInstance.createPayPalMessages).toHaveBeenCalledWith({
                buyerCountry: "US",
                currencyCode: "USD",
                shopperSessionId: undefined,
            });
        });
    });

    describe("session lifecycle", () => {
        test("should create new session when buyerCountry changes", () => {
            const { rerender } = renderHook(
                ({ buyerCountry }) =>
                    usePayPalMessages({
                        buyerCountry,
                        currencyCode: "USD",
                    }),
                { initialProps: { buyerCountry: "US" } },
            );

            jest.clearAllMocks();

            rerender({ buyerCountry: "GB" });

            expect(mockSdkInstance.createPayPalMessages).toHaveBeenCalledWith({
                buyerCountry: "GB",
                currencyCode: "USD",
                shopperSessionId: undefined,
            });
        });

        test("should create new session when currencyCode changes", () => {
            const { rerender } = renderHook(
                ({ currencyCode }) =>
                    usePayPalMessages({
                        buyerCountry: "US",
                        currencyCode,
                    }),
                { initialProps: { currencyCode: "USD" } },
            );

            jest.clearAllMocks();

            rerender({ currencyCode: "EUR" });

            expect(mockSdkInstance.createPayPalMessages).toHaveBeenCalledWith({
                buyerCountry: "US",
                currencyCode: "EUR",
                shopperSessionId: undefined,
            });
        });

        test("should create new session when shopperSessionId changes", () => {
            const { rerender } = renderHook(
                ({ shopperSessionId }) =>
                    usePayPalMessages({
                        buyerCountry: "US",
                        currencyCode: "USD",
                        shopperSessionId,
                    }),
                { initialProps: { shopperSessionId: "session-1" } },
            );

            jest.clearAllMocks();

            rerender({ shopperSessionId: "session-2" });

            expect(mockSdkInstance.createPayPalMessages).toHaveBeenCalledWith({
                buyerCountry: "US",
                currencyCode: "USD",
                shopperSessionId: "session-2",
            });
        });

        test("should create new session when sdkInstance changes", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { rerender } = renderHook(() => usePayPalMessages(props));

            jest.clearAllMocks();

            const newMockSession = createMockPayPalMessagesSession();
            const newMockSdkInstance = createMockSdkInstance(newMockSession);

            mockUsePayPal.mockReturnValue({
                // @ts-expect-error mocking sdk instance
                sdkInstance: newMockSdkInstance,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            rerender();

            expect(newMockSdkInstance.createPayPalMessages).toHaveBeenCalled();
        });
    });

    describe("handleFetchContent", () => {
        test("should successfully fetch content with valid options", async () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            const fetchOptions: FetchContentOptions = {
                amount: "100",
                logoPosition: "INLINE",
                logoType: "MONOGRAM",
            };

            let content: Record<string, unknown> | null | void = undefined;

            await act(async () => {
                content = await result.current.handleFetchContent(fetchOptions);
            });

            expect(mockMessagesSession.fetchContent).toHaveBeenCalledWith(
                fetchOptions,
            );
            expect(content).toEqual({
                content: "<div>Mock PayPal Messages content</div>",
                meta: {
                    trackingPayload: "mock-tracking-payload",
                },
            });
        });

        test("should return undefined when component is unmounted", async () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result, unmount } = renderHook(() =>
                usePayPalMessages(props),
            );

            unmount();

            let content: Record<string, unknown> | null | void = undefined;

            await act(async () => {
                content = await result.current.handleFetchContent({
                    amount: "100",
                    logoPosition: "INLINE",
                    logoType: "MONOGRAM",
                });
            });

            expect(content).toBeUndefined();
            expect(mockMessagesSession.fetchContent).not.toHaveBeenCalled();
        });

        test("should set error when session is not available", async () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            await act(async () => {
                await result.current.handleFetchContent({
                    amount: "100",
                    logoPosition: "INLINE",
                    logoType: "MONOGRAM",
                });
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toEqual(
                new Error("PayPal Messages session not available"),
            );
        });

        test("should set error when fetchContent returns null", async () => {
            (mockMessagesSession.fetchContent as jest.Mock).mockResolvedValue(
                null,
            );

            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            await act(async () => {
                await result.current.handleFetchContent({
                    amount: "100",
                    logoPosition: "INLINE",
                    logoType: "MONOGRAM",
                });
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toEqual(
                new Error("Failed to fetch PayPal Messages content"),
            );
        });
    });

    describe("handleCreateLearnMore", () => {
        test("should successfully create learn more link with options", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            const learnMoreOptions: LearnMoreOptions = {
                amount: "100",
                presentationMode: "MODAL",
            };

            let learnMore: LearnMore | undefined;

            act(() => {
                learnMore =
                    result.current.handleCreateLearnMore(learnMoreOptions);
            });

            expect(mockMessagesSession.createLearnMore).toHaveBeenCalledWith(
                learnMoreOptions,
            );
            expect(learnMore).toEqual({
                isOpen: false,
                open: expect.any(Function),
                close: expect.any(Function),
                update: expect.any(Function),
                show: expect.any(Function),
                setupPostMessenger: expect.any(Function),
            });
        });

        test("should successfully create learn more link without options", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            let learnMore: LearnMore | undefined;

            act(() => {
                learnMore = result.current.handleCreateLearnMore();
            });

            expect(mockMessagesSession.createLearnMore).toHaveBeenCalledWith(
                undefined,
            );
            expect(learnMore).toBeDefined();
        });

        test("should return undefined when component is unmounted", () => {
            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result, unmount } = renderHook(() =>
                usePayPalMessages(props),
            );

            unmount();

            let learnMore: LearnMore | undefined;

            act(() => {
                learnMore = result.current.handleCreateLearnMore();
            });

            expect(learnMore).toBeUndefined();
            expect(mockMessagesSession.createLearnMore).not.toHaveBeenCalled();
        });

        test("should set error when session is not available", () => {
            mockUsePayPal.mockReturnValue({
                sdkInstance: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                eligiblePaymentMethods: null,
                error: null,
                isHydrated: true,
            });

            const props: PayPalMessagesOptions = {
                buyerCountry: "US",
                currencyCode: "USD",
            };

            const { result } = renderHook(() => usePayPalMessages(props));

            act(() => {
                result.current.handleCreateLearnMore();
            });

            const { error } = result.current;

            expectCurrentErrorValue(error);

            expect(error).toEqual(
                new Error("PayPal Messages session not available"),
            );
        });
    });
});
