import { test, vi, describe, expect, expectTypeOf } from "vitest";

import {
  PayPalCardFieldsComponentOptions,
  PayPalCardFieldsComponent,
  PayPalCardFieldsBillingAddress,
  PayPalCardFieldsSubmitOptions,
  CardFieldsOnApproveData,
  CardFieldsVaultOnApproveData,
  CardFieldsLiabilityShift,
} from "../components/card-fields";

describe("testing createOrder and createVaultToken types", () => {
  test("only creatOrder", () => {
    const createOrderCallback: PayPalCardFieldsComponentOptions = {
      createOrder: vi.fn(),
      onApprove: (data) => {
        expectTypeOf(data).toEqualTypeOf<CardFieldsOnApproveData>();
        expectTypeOf(data.orderID).toBeString();
        // @ts-expect-error: vaultSetupToken does not exist on CardFieldsOnApproveData in createOrder config
        const token = data.vaultSetupToken;
      },
      onError: vi.fn(),
    };

    expect(createOrderCallback.createVaultSetupToken).toBeUndefined();
  });

  test("only createVaultSetupToken", () => {
    const createVaultSetupTokenCallback: PayPalCardFieldsComponentOptions = {
      createVaultSetupToken: vi.fn(),
      onApprove: (data) => {
        expectTypeOf(data).toEqualTypeOf<CardFieldsVaultOnApproveData>();
        expectTypeOf(data.vaultSetupToken).toBeString();
        // @ts-expect-error: orderID does not exist on CardFieldsVaultOnApproveData in createVaultSetupToken config
        const order = data.orderID;
      },
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

  test("submit rejects invalid billingAddress type", () => {
    mockCardFields.submit({
      // @ts-expect-error: billingAddress should be an object, not a string
      billingAddress: "123 Main St",
    });
  });

  test("submit rejects non-object argument", () => {
    // @ts-expect-error: submit should not accept a string
    mockCardFields.submit("billingAddress");
  });

  test("CardFieldsOnApproveData requires orderID and supports CardFieldsLiabilityShift", () => {
    const orderData: CardFieldsOnApproveData = {
      orderID: "ORDER-12345",
      liabilityShift: "POSSIBLE",
    };
    expect(orderData.orderID).toBe("ORDER-12345");
    expect(orderData.liabilityShift).toBe("POSSIBLE");

    expectTypeOf(orderData).toEqualTypeOf<CardFieldsOnApproveData>();
    expectTypeOf(orderData.orderID).toBeString();
    expectTypeOf(orderData.liabilityShift).toEqualTypeOf<
      CardFieldsLiabilityShift | undefined
    >();

    const invalidOrderData = {
      liabilityShift: "POSSIBLE",
    };
    // @ts-expect-error: orderID is required for CardFieldsOnApproveData
    const typedOrderData: CardFieldsOnApproveData = invalidOrderData;
    expect(typedOrderData).toBeDefined();
  });

  test("CardFieldsVaultOnApproveData requires vaultSetupToken and supports CardFieldsLiabilityShift", () => {
    const vaultData: CardFieldsVaultOnApproveData = {
      vaultSetupToken: "VAULT-TOKEN-67890",
      liabilityShift: "YES",
    };
    expect(vaultData.vaultSetupToken).toBe("VAULT-TOKEN-67890");
    expect(vaultData.liabilityShift).toBe("YES");

    expectTypeOf(vaultData).toEqualTypeOf<CardFieldsVaultOnApproveData>();
    expectTypeOf(vaultData.vaultSetupToken).toBeString();
    expectTypeOf(vaultData.liabilityShift).toEqualTypeOf<
      CardFieldsLiabilityShift | undefined
    >();

    const invalidVaultData = {
      liabilityShift: "YES",
    };
    // @ts-expect-error: vaultSetupToken is required for CardFieldsVaultOnApproveData
    const typedVaultData: CardFieldsVaultOnApproveData = invalidVaultData;
    expect(typedVaultData).toBeDefined();
  });

  test("CardFieldsLiabilityShift supports standard values and custom string while maintaining type completion", () => {
    const shiftPossible: CardFieldsLiabilityShift = "POSSIBLE";
    const shiftYes: CardFieldsLiabilityShift = "YES";
    const shiftNo: CardFieldsLiabilityShift = "NO";
    const shiftUnknown: CardFieldsLiabilityShift = "UNKNOWN";
    const shiftCustom: CardFieldsLiabilityShift = "CUSTOM_VALUE";

    expect(shiftPossible).toBe("POSSIBLE");
    expect(shiftYes).toBe("YES");
    expect(shiftNo).toBe("NO");
    expect(shiftUnknown).toBe("UNKNOWN");
    expect(shiftCustom).toBe("CUSTOM_VALUE");
  });
});
