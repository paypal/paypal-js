import { renderHook } from "@testing-library/react-hooks";

import {
    useEligibleMethods,
    fetchEligibleMethods,
    type FindEligiblePaymentMethodsRequestPayload,
} from "./useEligibleMethods";

import type { FindEligiblePaymentMethodsResponse } from "../types";

// Mock fetch globally
global.fetch = jest.fn();

describe("fetchEligibleMethods", () => {
    const mockClientToken = "test-client-token";
    const mockPayload: FindEligiblePaymentMethodsRequestPayload = {
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                },
            },
        ],
    };

    const mockResponse: FindEligiblePaymentMethodsResponse = {
        eligible_methods: {
            paypal: {
                can_be_vaulted: true,
                eligible_in_paypal_network: true,
                recommended: true,
            },
            venmo: {
                can_be_vaulted: false,
                eligible_in_paypal_network: true,
            },
        },
        supplementary_data: {
            buyer_country_code: "US",
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should successfully fetch eligible methods with sandbox environment", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const result = await fetchEligibleMethods({
            clientToken: mockClientToken,
            payload: mockPayload,
            environment: "sandbox",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api-m.sandbox.paypal.com/v2/payments/find-eligible-methods",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${mockClientToken}`,
                    Accept: "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                },
                body: JSON.stringify(mockPayload),
                signal: undefined,
            },
        );

        expect(result).toEqual(mockResponse);
    });

    test("should successfully fetch eligible methods with production environment", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            payload: mockPayload,
            environment: "production",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "https://api-m.paypal.com/v2/payments/find-eligible-methods",
            expect.objectContaining({
                method: "POST",
            }),
        );
    });

    test("should send empty payload when no payload is provided", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            environment: "sandbox",
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({}),
            }),
        );
    });

    test("should handle HTTP error responses", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 401,
        });

        await expect(
            fetchEligibleMethods({
                clientToken: mockClientToken,
                environment: "sandbox",
            }),
        ).rejects.toThrow("Eligibility API error: 401");
    });

    test("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error("Network error"),
        );

        await expect(
            fetchEligibleMethods({
                clientToken: mockClientToken,
                environment: "sandbox",
            }),
        ).rejects.toThrow("Failed to fetch eligible methods: Network error");
    });

    test("should support abort signal", async () => {
        const abortController = new AbortController();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        await fetchEligibleMethods({
            clientToken: mockClientToken,
            environment: "sandbox",
            signal: abortController.signal,
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                signal: abortController.signal,
            }),
        );
    });
});

describe("useEligibleMethods", () => {
    const mockClientToken = "test-client-token";
    const mockResponse: FindEligiblePaymentMethodsResponse = {
        eligible_methods: {
            paypal: {
                can_be_vaulted: true,
                eligible_in_paypal_network: true,
                recommended: true,
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("with eligibleMethodsResponse provided", () => {
        test("should immediately return the provided response without fetching", () => {
            const { result } = renderHook(() =>
                useEligibleMethods({
                    eligibleMethodsResponse: mockResponse,
                    clientToken: mockClientToken,
                    environment: "sandbox",
                }),
            );

            expect(result.current.isLoading).toBe(false);
            expect(result.current.eligibleMethods).toEqual(mockResponse);
            expect(result.current.error).toBeNull();
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test("should not fetch even if clientToken changes when response is provided", () => {
            const { result, rerender } = renderHook(
                ({ clientToken }) =>
                    useEligibleMethods({
                        eligibleMethodsResponse: mockResponse,
                        clientToken,
                        environment: "sandbox",
                    }),
                {
                    initialProps: { clientToken: "token-1" },
                },
            );

            expect(result.current.isLoading).toBe(false);

            rerender({ clientToken: "token-2" });

            expect(global.fetch).not.toHaveBeenCalled();
            expect(result.current.eligibleMethods).toEqual(mockResponse);
        });
    });

    describe("with clientToken (fetching eligibility)", () => {
        test("should fetch eligible methods successfully", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const { result, waitForNextUpdate } = renderHook(() =>
                useEligibleMethods({
                    clientToken: mockClientToken,
                    environment: "sandbox",
                }),
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.eligibleMethods).toBeNull();

            await waitForNextUpdate();

            expect(result.current.isLoading).toBe(false);
            expect(result.current.eligibleMethods).toEqual(mockResponse);
            expect(result.current.error).toBeNull();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        test("should pass payload to the fetch function", async () => {
            const mockPayload: FindEligiblePaymentMethodsRequestPayload = {
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                        },
                    },
                ],
            };

            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const { result, waitForNextUpdate } = renderHook(() =>
                useEligibleMethods({
                    clientToken: mockClientToken,
                    payload: mockPayload,
                    environment: "sandbox",
                }),
            );

            await waitForNextUpdate();

            expect(result.current.isLoading).toBe(false);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(mockPayload),
                }),
            );
        });

        test("should handle fetch errors", async () => {
            const consoleErrorSpy = jest
                .spyOn(console, "error")
                .mockImplementation(() => {});

            (global.fetch as jest.Mock).mockRejectedValueOnce(
                new Error("Network error"),
            );

            const { result, waitForNextUpdate } = renderHook(() =>
                useEligibleMethods({
                    clientToken: mockClientToken,
                    environment: "sandbox",
                }),
            );

            await waitForNextUpdate();

            expect(result.current.isLoading).toBe(false);
            expect(result.current.eligibleMethods).toBeNull();
            expect(result.current.error).toEqual(
                new Error("Failed to fetch eligible methods: Network error"),
            );

            consoleErrorSpy.mockRestore();
        });

        test("should abort fetch on unmount", async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                ok: true,
                                json: async () => mockResponse,
                            });
                        }, 100);
                    }),
            );

            const { unmount } = renderHook(() =>
                useEligibleMethods({
                    clientToken: mockClientToken,
                    environment: "sandbox",
                }),
            );

            unmount();

            // Verify abort was called
            const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
            const signal = fetchCall[1].signal;
            expect(signal.aborted).toBe(true);
        });

        test("should not update state if component unmounts before fetch completes", async () => {
            (global.fetch as jest.Mock).mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                ok: true,
                                json: async () => mockResponse,
                            });
                        }, 100);
                    }),
            );

            const { result, unmount } = renderHook(() =>
                useEligibleMethods({
                    clientToken: mockClientToken,
                    environment: "sandbox",
                }),
            );

            expect(result.current.isLoading).toBe(true);

            unmount();

            // Wait a bit to ensure the fetch would have completed
            await new Promise((resolve) => setTimeout(resolve, 150));

            // State should remain in loading state since component unmounted
            expect(result.current.isLoading).toBe(true);
            expect(result.current.eligibleMethods).toBeNull();
        });
    });

    describe("error handling", () => {
        test("should wait gracefully when clientToken is not available", () => {
            const { result } = renderHook(() =>
                useEligibleMethods({
                    clientToken: undefined,
                    environment: "sandbox",
                }),
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeNull();
            expect(result.current.eligibleMethods).toBeNull();
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test("should fetch when clientToken becomes available", async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            });

            const { result, rerender, waitForNextUpdate } = renderHook(
                ({ clientToken }) =>
                    useEligibleMethods({
                        clientToken,
                        environment: "sandbox",
                    }),
                {
                    initialProps: {
                        clientToken: undefined as string | undefined,
                    },
                },
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.error).toBeNull();
            expect(global.fetch).not.toHaveBeenCalled();

            rerender({ clientToken: mockClientToken });

            await waitForNextUpdate();

            expect(result.current.isLoading).toBe(false);
            expect(result.current.eligibleMethods).toEqual(mockResponse);
            expect(result.current.error).toBeNull();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe("memoization and re-fetching", () => {
        test("should not re-fetch when payload reference changes but content is the same", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const payload1 = {
                purchase_units: [{ amount: { currency_code: "USD" } }],
            };

            const { waitForNextUpdate, rerender } = renderHook(
                ({ payload }) =>
                    useEligibleMethods({
                        clientToken: mockClientToken,
                        payload,
                        environment: "sandbox",
                    }),
                {
                    initialProps: { payload: payload1 },
                },
            );

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);

            // Clear mocks to track new calls
            jest.clearAllMocks();

            // Create new object with same content
            const payload2 = {
                purchase_units: [{ amount: { currency_code: "USD" } }],
            };

            rerender({ payload: payload2 });

            // Should not fetch again
            await new Promise((resolve) => setTimeout(resolve, 100));
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test("should re-fetch when payload content actually changes", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const payload1 = {
                purchase_units: [{ amount: { currency_code: "USD" } }],
            };

            const { waitForNextUpdate, rerender } = renderHook(
                ({ payload }) =>
                    useEligibleMethods({
                        clientToken: mockClientToken,
                        payload,
                        environment: "sandbox",
                    }),
                {
                    initialProps: { payload: payload1 },
                },
            );

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);

            // Clear mocks to track new calls
            jest.clearAllMocks();

            // Create new object with different content
            const payload2 = {
                purchase_units: [{ amount: { currency_code: "EUR" } }],
            };

            rerender({ payload: payload2 });

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        test("should not re-fetch when eligibleMethodsResponse reference changes but content is the same", () => {
            const response1 = {
                eligible_methods: {
                    paypal: { can_be_vaulted: true },
                },
            };

            const { result, rerender } = renderHook(
                ({ response }) =>
                    useEligibleMethods({
                        eligibleMethodsResponse: response,
                        clientToken: mockClientToken,
                        environment: "sandbox",
                    }),
                {
                    initialProps: { response: response1 },
                },
            );

            expect(result.current.isLoading).toBe(false);
            expect(result.current.eligibleMethods).toEqual(response1);

            // Create new object with same content
            const response2 = {
                eligible_methods: {
                    paypal: { can_be_vaulted: true },
                },
            };

            rerender({ response: response2 });

            expect(global.fetch).not.toHaveBeenCalled();
            expect(result.current.eligibleMethods).toEqual(response2);
        });

        test("should re-fetch when clientToken changes", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const { waitForNextUpdate, rerender } = renderHook(
                ({ clientToken }) =>
                    useEligibleMethods({
                        clientToken,
                        environment: "sandbox",
                    }),
                {
                    initialProps: { clientToken: "token-1" },
                },
            );

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);

            jest.clearAllMocks();

            rerender({ clientToken: "token-2" });

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: "Bearer token-2",
                    }),
                }),
            );
        });

        test("should re-fetch when environment changes", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });

            const { waitForNextUpdate, rerender } = renderHook(
                ({ environment }) =>
                    useEligibleMethods({
                        clientToken: mockClientToken,
                        environment,
                    }),
                {
                    initialProps: {
                        environment: "sandbox" as "sandbox" | "production",
                    },
                },
            );

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                "https://api-m.sandbox.paypal.com/v2/payments/find-eligible-methods",
                expect.any(Object),
            );

            jest.clearAllMocks();

            rerender({ environment: "production" });

            await waitForNextUpdate();

            expect(global.fetch).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledWith(
                "https://api-m.paypal.com/v2/payments/find-eligible-methods",
                expect.any(Object),
            );
        });
    });
});
