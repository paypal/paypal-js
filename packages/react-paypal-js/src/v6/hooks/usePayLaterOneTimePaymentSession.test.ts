import { act, renderHook } from "@testing-library/react-hooks";

import { usePayPal } from "./usePayPal";
import { usePayLaterOneTimePaymentSession } from "./usePayLaterOneTimePaymentSession";
import { useProxyProps } from "../utils";

import type { OneTimePaymentSession } from "../types";

jest.mock("./usePayPal", () => ({
    usePayPal: jest.fn(),
}));

jest.mock("../utils", () => ({
    useProxyProps: jest.fn(),
}));

describe("usePayLaterOneTimePaymentSession", () => {
    beforeEach(() => {
        // mocking this for each test rather than a module so it can be easily unmocked
        // where needed
        (useProxyProps as jest.Mock).mockImplementation(
            (callbacks) => callbacks,
        );
    });

    test("should create a pay later payment session when the hook is called", () => {
        const mockOrderId = "123";
        const mockOnApprove = jest.fn();
        const mockOnCancel = jest.fn();
        const mockOnError = jest.fn();
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                orderId: mockOrderId,
                onApprove: mockOnApprove,
                onCancel: mockOnCancel,
                onError: mockOnError,
            }),
        );

        expect(mockCreatePayLaterOneTimePaymentSession).toHaveBeenCalledTimes(
            1,
        );
        expect(mockCreatePayLaterOneTimePaymentSession).toHaveBeenCalledWith({
            orderId: mockOrderId,
            onApprove: mockOnApprove,
            onCancel: mockOnCancel,
            onError: mockOnError,
        });
    });

    test("should error if there is no sdkInstance when called", () => {
        const mockOrderId = "123";

        (usePayPal as jest.Mock).mockReturnValue({ sdkInstance: null });

        const {
            result: {
                current: { error },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                orderId: mockOrderId,
                onApprove: jest.fn(),
            }),
        );

        expect(error).toEqual(new Error("no sdk instance available"));
    });

    test("should provide a click handler that calls session start", async () => {
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                orderId: "123",
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleClick();
        });

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith(
            {
                presentationMode: mockPresentationMode,
                fullPageOverlay: undefined,
                autoRedirect: undefined,
            },
            undefined,
        );
    });

    test("should call the createOrder callback, if it was provided, on start inside the click handler", async () => {
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockOrderIdPromise = Promise.resolve({ orderId: "123" });
        const mockCreateOrder = jest.fn(() => mockOrderIdPromise);
        const mockOnApprove = jest.fn();
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
                onApprove: mockOnApprove,
            }),
        );

        await act(async () => {
            handleClick();
        });

        expect(mockCreatePayLaterOneTimePaymentSession).toHaveBeenCalledWith({
            onApprove: mockOnApprove,
            orderId: undefined,
        });

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith(
            {
                presentationMode: mockPresentationMode,
                fullPageOverlay: undefined,
                autoRedirect: undefined,
            },
            mockOrderIdPromise,
        );
    });

    test("should error if the click handler is called and there is no session", async () => {
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(null);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockOrderIdPromise = Promise.resolve({ orderId: "123" });
        const mockCreateOrder = jest.fn(() => mockOrderIdPromise);
        const { result } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            await result.current.handleClick();
        });

        expect(result.current.error).toEqual(
            new Error("PayLater session not available"),
        );
    });

    test("should do nothing if the click handler is called after unmount", async () => {
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockOrderIdPromise = Promise.resolve({ orderId: "123" });
        const mockCreateOrder = jest.fn(() => mockOrderIdPromise);
        const { result, unmount } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
            }),
        );

        unmount();

        await act(async () => {
            await result.current.handleClick();
        });

        expect(result.current.error).toBeNull();
        expect(mockStart).not.toHaveBeenCalled();
    });

    test("should provide a cancel handler that cancels the session", async () => {
        const mockCancel = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: mockCancel,
            destroy: jest.fn(),
            start: jest.fn(),
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockOrderIdPromise = Promise.resolve({ orderId: "123" });
        const mockCreateOrder = jest.fn(() => mockOrderIdPromise);
        const {
            result: {
                current: { handleCancel },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleCancel();
        });

        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    test("should provide a destroy handler that destroys the session", async () => {
        const mockDestroy = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const mockPresentationMode = "auto";
        const mockOrderIdPromise = Promise.resolve({ orderId: "123" });
        const mockCreateOrder = jest.fn(() => mockOrderIdPromise);
        const {
            result: {
                current: { handleDestroy },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
                onApprove: jest.fn(),
            }),
        );

        await act(async () => {
            handleDestroy();
        });

        expect(mockDestroy).toHaveBeenCalledTimes(1);
    });

    test("should not re-run if callbacks are updated", () => {
        // For this test, we want to use actual useProxyProps so the callbacks can update without triggering
        // the hook to run again and create another session.
        (useProxyProps as jest.Mock).mockImplementation(
            jest.requireActual("../utils").useProxyProps,
        );

        const mockOrderId = "123";
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: jest.fn(),
            start: mockStart,
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        let mockOnApprove = jest.fn();
        let mockOnCancel = jest.fn();
        let mockOnError = jest.fn();

        const { rerender } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                orderId: mockOrderId,
                onApprove: mockOnApprove,
                onCancel: mockOnCancel,
                onError: mockOnError,
            }),
        );

        // trigger a rerender with new callbacks, this should not cause new session to be created
        mockOnApprove = jest.fn();
        mockOnCancel = jest.fn();
        mockOnError = jest.fn();

        rerender();

        expect(mockCreatePayLaterOneTimePaymentSession).toHaveBeenCalledTimes(
            1,
        );
    });

    test("should destroy the previous session when the hook re-runs with a new sdkInstance", () => {
        const mockDestroy = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValueOnce({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const { rerender } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                orderId: "1234",
                onApprove: jest.fn(),
            }),
        );

        // return a new value for sdkInstance to cause session creation useEffecto run again
        (usePayPal as jest.Mock).mockReturnValueOnce({
            sdkInstance: {},
        });

        rerender();

        expect(mockSession.destroy).toHaveBeenCalledTimes(1);
    });

    test("should destroy the previous session when the hook re-runs with a new orderId", () => {
        const mockDestroy = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: jest.fn(),
            destroy: mockDestroy,
            start: jest.fn(),
        };
        const mockCreatePayLaterOneTimePaymentSession = jest
            .fn()
            .mockReturnValue(mockSession);

        (usePayPal as jest.Mock).mockReturnValue({
            sdkInstance: {
                createPayLaterOneTimePaymentSession:
                    mockCreatePayLaterOneTimePaymentSession,
            },
        });

        const { rerender } = renderHook(
            ({ orderId }) =>
                usePayLaterOneTimePaymentSession({
                    presentationMode: "auto",
                    orderId,
                    onApprove: jest.fn(),
                }),
            {
                initialProps: { orderId: "1234" },
            },
        );

        rerender({ orderId: "5678" });

        expect(mockSession.destroy).toHaveBeenCalledTimes(1);
    });
});
