import {
    useFetchEligibleMethods,
    type FindEligiblePaymentMethodsRequestPayload,
} from "./useFetchEligibleMethods";

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
    const mockHeaders = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${mockClientToken}`,
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
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

        const result = await useFetchEligibleMethods({
            payload: mockPayload,
            environment: "sandbox",
            headers: mockHeaders,
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

        await useFetchEligibleMethods({
            payload: mockPayload,
            environment: "production",
            headers: mockHeaders,
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

        await useFetchEligibleMethods({
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
            useFetchEligibleMethods({
                environment: "sandbox",
            }),
        ).rejects.toThrow("Eligibility API error: 401");
    });

    test("should handle network errors", async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(
            new Error("Network error"),
        );

        await expect(
            useFetchEligibleMethods({
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

        await useFetchEligibleMethods({
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
