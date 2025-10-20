import React from "react";
import { renderHook } from "@testing-library/react-hooks";

import { usePayPal } from "./usePayPal";
import { usePayLaterOneTimePaymentSession } from "./useCreatePayLaterOneTimePaymentSession";

import type { OneTimePaymentSession } from "../types";

jest.mock("./usePayPal", () => ({
    usePayPal: jest.fn(),
}));

jest.mock("../utils", () => ({
    useProxyProps: jest.fn((callbacks) => callbacks),
}));

// TODO cleanup and unify what can be unified
//
describe("usePayLaterOneTimePaymentSession", () => {
    it("should create a pay later payment session when the hook is called", () => {
        const mockOrderId = "123";
        const mockOnApprove = jest.fn();
        const mockOnCancel = jest.fn();
        const mockOnError = jest.fn();
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
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

    it("should error if there is no sdkInstance when called", () => {
        const mockOrderId = "123";

        (usePayPal as jest.Mock).mockReturnValue({ sdkInstance: null });

        const {
            result: { error },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: "auto",
                orderId: mockOrderId,
            }),
        );

        expect(error).toEqual(new Error("no sdk instance available"));
    });

    it("should provide a click handler that calls session start", () => {
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
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
            }),
        );

        handleClick();

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith({
            presentationMode: mockPresentationMode,
        });
    });

    it("should call the createOrder callback, if it was provided, on start inside the click handler", () => {
        const mockStart = jest.fn();
        const mockSession: OneTimePaymentSession = {
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
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
            }),
        );

        handleClick();

        expect(mockStart).toHaveBeenCalledTimes(1);
        expect(mockStart).toHaveBeenCalledWith(
            { presentationMode: mockPresentationMode },
            mockOrderIdPromise,
        );
    });

    it("should error if the click handler is called and there is no session", async () => {
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
        const {
            result: {
                current: { handleClick },
            },
        } = renderHook(() =>
            usePayLaterOneTimePaymentSession({
                presentationMode: mockPresentationMode,
                createOrder: mockCreateOrder,
            }),
        );

        await expect(handleClick).rejects.toThrowError(
            "paylater session not available",
        );
    });

    it("should provide a cancel handler that cancels the session", () => {
        const mockCancel = jest.fn();
        const mockSession: OneTimePaymentSession = {
            cancel: mockCancel,
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
            }),
        );

        handleCancel();

        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("should provide a destroy handler that destroys the session", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should not re-run if callbacks are updated", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should destroy the session when the parent component is unmounted", () => {
        // TODO implement
        throw new Error("implement");
    });
});
