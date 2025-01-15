import { test, vi, describe, expect } from "vitest";

import { PayPalCardFieldsComponentOptions } from "../components/card-fields";

describe("testing", () => {
    test("only creatOrder", () => {
        const createOrderCallback: PayPalCardFieldsComponentOptions = {
            createOrder: vi.fn(),
            onApprove: vi.fn(),
            onError: vi.fn(),
        };

        expect(createOrderCallback.createVaultSetupToken).toBeUndefined();
    });

    test("only createVaultSetupToken", () => {
        const createVaultSetupTokenCallback: PayPalCardFieldsComponentOptions =
            {
                createVaultSetupToken: vi.fn(),
                onApprove: vi.fn(),
                onError: vi.fn(),
            };

        expect(createVaultSetupTokenCallback.createOrder).toBeUndefined();
    });

    test.skip("Can't have both", () => {
        // @ts-expect-error : should throw error if both createOrder and createVaultSetuptoken called
        const callback: PayPalCardFieldsComponentOptions = {
            createOrder: vi.fn(),
            createVaultSetupToken: vi.fn(),
            onApprove: vi.fn(),
            onError: vi.fn(),
        };

        expect(callback).toThrowError();
    });

    test.skip("Can't have both", () => {
        // @ts-expect-error: should throw error if neither createOrder or createVaultSetuptoken called
        const callback: PayPalCardFieldsComponentOptions = {
            onApprove: vi.fn(),
            onError: vi.fn(),
        };

        expect(callback).toThrowError();
    });
});
