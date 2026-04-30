import { test, vi, describe, expect } from "vitest";

import {
  PayPalCardFieldsComponentOptions,
  PayPalCardFieldsComponent,
  PayPalCardFieldsBillingAddress,
  PayPalCardFieldsSubmitOptions,
} from "../components/card-fields";

describe.only("testing createOrder and createVaultToken types", () => {
  test("only creatOrder", () => {
    const createOrderCallback: PayPalCardFieldsComponentOptions = {
      createOrder: vi.fn(),
      onApprove: vi.fn(),
      onError: vi.fn(),
    };

    expect(createOrderCallback.createVaultSetupToken).toBeUndefined();
  });

  test("only createVaultSetupToken", () => {
    const createVaultSetupTokenCallback: PayPalCardFieldsComponentOptions = {
      createVaultSetupToken: vi.fn(),
      onApprove: vi.fn(),
      onError: vi.fn(),
    };

    expect(createVaultSetupTokenCallback.createOrder).toBeUndefined();
  });

  test.skip("Can't have both createOrdre and createVaultSetupToken", () => {
    // @ts-expect-error : should throw error if both createOrder and createVaultSetupToken called
    const callback: PayPalCardFieldsComponentOptions = {
      createOrder: vi.fn(),
      createVaultSetupToken: vi.fn(),
      onApprove: vi.fn(),
      onError: vi.fn(),
    };

    expect(callback).toThrowError();
  });

  test.skip("Can't implement neither", () => {
    // @ts-expect-error: should throw error if neither createOrder or createVaultSetuptoken called
    const callback: PayPalCardFieldsComponentOptions = {
      onApprove: vi.fn(),
      onError: vi.fn(),
    };

    expect(callback).toThrowError();
  });
});

describe("testing submit options types", () => {
  const mockCardFields = {
    getState: vi.fn(),
    isEligible: vi.fn(),
    submit: vi.fn(),
    NameField: vi.fn(),
    NumberField: vi.fn(),
    CVVField: vi.fn(),
    ExpiryField: vi.fn(),
  } as unknown as PayPalCardFieldsComponent;

  test("submit with no arguments", () => {
    mockCardFields.submit();
  });

  test("submit with empty options", () => {
    mockCardFields.submit({});
  });

  test("submit with billingAddress only", () => {
    mockCardFields.submit({
      billingAddress: {
        postalCode: "12345",
        countryCode: "US",
      },
    });
  });

  test("submit with name only", () => {
    mockCardFields.submit({ name: "John Doe" });
  });

  test("submit with all options", () => {
    mockCardFields.submit({
      name: "John Doe",
      billingAddress: {
        addressLine1: "123 Main St",
        addressLine2: "Apt 4B",
        adminArea2: "San Jose",
        adminArea1: "CA",
        postalCode: "95131",
        countryCode: "US",
      },
    });
  });

  test("BillingAddress allows all fields optional", () => {
    const emptyAddress: PayPalCardFieldsBillingAddress = {};
    expect(emptyAddress).toBeDefined();
  });

  test("SubmitOptions allows all fields optional", () => {
    const emptyOptions: PayPalCardFieldsSubmitOptions = {};
    expect(emptyOptions).toBeDefined();
  });
});
