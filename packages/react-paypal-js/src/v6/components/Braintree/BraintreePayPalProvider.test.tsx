import "@testing-library/jest-dom";
import React from "react";
import { act, render, waitFor } from "@testing-library/react";

import { expectCurrentErrorValue } from "../../hooks/useErrorTestUtil";
import { BraintreePayPalProvider } from "./BraintreePayPalProvider";
import { useBraintreePayPal } from "../../hooks/Braintree/useBraintreePayPal";
import { INSTANCE_LOADING_STATE } from "../../types/ProviderEnums";

import type { BraintreeV6Namespace } from "../../types";
import type { BraintreePayPalState } from "../../context/BraintreePayPalContext";

const TEST_CLIENT_TOKEN = "test-braintree-client-token";

function createMockBraintreeNamespace() {
  const mockPayPalCheckoutInstance = {
    loadPayPalSDK: jest.fn().mockResolvedValue(undefined),
    tokenizePayment: jest.fn().mockResolvedValue({
      nonce: "test-nonce",
      type: "PayPalAccount",
      details: {
        email: "test@example.com",
        payerId: "payer-id",
        firstName: "Test",
        lastName: "User",
      },
    }),
    createOneTimePaymentSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createBillingAgreementSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createCheckoutWithVaultSession: jest
      .fn()
      .mockReturnValue({ start: jest.fn() }),
    createPayLaterSession: jest.fn().mockReturnValue({ start: jest.fn() }),
    createPayment: jest.fn().mockResolvedValue("order-id"),
    findEligibleMethods: jest.fn().mockResolvedValue({
      paypal: true,
      paylater: false,
      credit: false,
      getDetails: jest.fn().mockReturnValue(null),
    }),
    getClientId: jest.fn().mockResolvedValue("client-id"),
    updatePayment: jest.fn().mockResolvedValue(undefined),
    teardown: jest.fn().mockResolvedValue(undefined),
  };

  const mockClientInstance = { authorization: TEST_CLIENT_TOKEN };

  const namespace: BraintreeV6Namespace = {
    client: {
      create: jest.fn().mockResolvedValue(mockClientInstance),
    },
    paypalCheckoutV6: {
      create: jest.fn().mockResolvedValue(mockPayPalCheckoutInstance),
    },
  };

  return {
    namespace,
    mockClientInstance,
    mockPayPalCheckoutInstance,
  };
}

function setupTestComponent() {
  const state: BraintreePayPalState = {
    loadingStatus: INSTANCE_LOADING_STATE.PENDING,
    braintreePayPalCheckoutInstance: null,
    isHydrated: false,
    error: null,
  };

  function TestComponent({ children = null }: { children?: React.ReactNode }) {
    const instanceState = useBraintreePayPal();
    Object.assign(state, instanceState);
    return <>{children}</>;
  }

  return {
    state,
    TestComponent,
  };
}

function expectResolvedState(state: Partial<BraintreePayPalState>): void {
  expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.RESOLVED);
  expect(state.braintreePayPalCheckoutInstance).toBeTruthy();
  expect(state.error).toBe(null);
}

function expectRejectedState(
  state: Partial<BraintreePayPalState>,
  error?: Error,
): void {
  expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
  if (error) {
    expectCurrentErrorValue(error);
    expect(state.error).toEqual(error);
  }
}

function expectPendingState(state: Partial<BraintreePayPalState>): void {
  expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.PENDING);
}

async function renderProvider(
  props: Partial<React.ComponentProps<typeof BraintreePayPalProvider>> = {},
) {
  const { state, TestComponent } = setupTestComponent();
  const { namespace: namespaceProp, braintreeClientToken, children } = props;

  const resolvedClientToken =
    "braintreeClientToken" in props ? braintreeClientToken : TEST_CLIENT_TOKEN;

  const { namespace: defaultNamespace } = createMockBraintreeNamespace();
  const namespace = namespaceProp ?? defaultNamespace;

  let result!: ReturnType<typeof render>;

  await act(async () => {
    result = render(
      <BraintreePayPalProvider
        namespace={namespace}
        braintreeClientToken={resolvedClientToken}
      >
        <TestComponent>{children}</TestComponent>
      </BraintreePayPalProvider>,
    );
  });

  return { ...result, state, namespace };
}

describe("BraintreePayPalProvider", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should set loadingStatus to 'resolved' when initialization succeeds", async () => {
      const { state } = await renderProvider();

      await waitFor(() => expectResolvedState(state));
    });

    test("should call client.create with braintreeClientToken", async () => {
      const { namespace: mockNamespace } = createMockBraintreeNamespace();

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectResolvedState(state));

      expect(mockNamespace.client.create).toHaveBeenCalledWith({
        authorization: TEST_CLIENT_TOKEN,
      });
    });

    test("should call paypalCheckoutV6.create with client instance", async () => {
      const { namespace: mockNamespace, mockClientInstance } =
        createMockBraintreeNamespace();

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectResolvedState(state));

      expect(mockNamespace.paypalCheckoutV6.create).toHaveBeenCalledWith({
        client: mockClientInstance,
      });
    });

    test("should call loadPayPalSDK on checkout instance", async () => {
      const { namespace: mockNamespace, mockPayPalCheckoutInstance } =
        createMockBraintreeNamespace();

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectResolvedState(state));

      expect(mockPayPalCheckoutInstance.loadPayPalSDK).toHaveBeenCalled();
    });

    test("should render children immediately while loading", async () => {
      const childRenderSpy = jest.fn();
      const TestChild = () => {
        childRenderSpy();
        return <div>Test Child Content</div>;
      };

      const { namespace } = createMockBraintreeNamespace();
      const { TestComponent } = setupTestComponent();

      await act(async () => {
        render(
          <BraintreePayPalProvider
            namespace={namespace}
            braintreeClientToken={TEST_CLIENT_TOKEN}
          >
            <TestComponent>
              <TestChild />
            </TestComponent>
          </BraintreePayPalProvider>,
        );
      });

      expect(childRenderSpy).toHaveBeenCalled();
    });
  });

  describe("Namespace Validation", () => {
    test("should reject when namespace is missing client.create", async () => {
      const invalidNamespace = {
        client: {},
        paypalCheckoutV6: { create: jest.fn() },
      } as unknown as BraintreeV6Namespace;

      const { state } = await renderProvider({
        namespace: invalidNamespace,
      });

      await waitFor(() => {
        expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
        expect(state.error?.message).toContain("Invalid Braintree namespace");
      });
    });

    test("should reject when namespace is missing paypalCheckoutV6.create", async () => {
      const invalidNamespace = {
        client: { create: jest.fn() },
        paypalCheckoutV6: {},
      } as unknown as BraintreeV6Namespace;

      const { state } = await renderProvider({
        namespace: invalidNamespace,
      });

      await waitFor(() => {
        expect(state.loadingStatus).toBe(INSTANCE_LOADING_STATE.REJECTED);
        expect(state.error?.message).toContain("Invalid Braintree namespace");
      });
    });
  });

  describe("Error Handling", () => {
    test("should reject when braintreeClientToken is undefined", async () => {
      const { state } = await renderProvider({
        braintreeClientToken: undefined,
      });

      await waitFor(() => {
        expectRejectedState(state);
        expect(state.error?.message).toContain(
          "Braintree client token is required",
        );
      });
    });

    test("should handle client.create failure", async () => {
      const clientError = new Error("Client creation failed");
      const { namespace: mockNamespace } = createMockBraintreeNamespace();
      (mockNamespace.client.create as jest.Mock).mockRejectedValue(clientError);

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectRejectedState(state, clientError));
    });

    test("should handle paypalCheckoutV6.create failure", async () => {
      const checkoutError = new Error("Checkout creation failed");
      const { namespace: mockNamespace } = createMockBraintreeNamespace();
      (mockNamespace.paypalCheckoutV6.create as jest.Mock).mockRejectedValue(
        checkoutError,
      );

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectRejectedState(state, checkoutError));
    });

    test("should handle loadPayPalSDK failure", async () => {
      const sdkError = new Error("SDK loading failed");
      const { namespace: mockNamespace, mockPayPalCheckoutInstance } =
        createMockBraintreeNamespace();
      mockPayPalCheckoutInstance.loadPayPalSDK.mockRejectedValue(sdkError);

      const { state } = await renderProvider({
        namespace: mockNamespace,
      });

      await waitFor(() => expectRejectedState(state, sdkError));
    });
  });

  describe("Component Lifecycle", () => {
    test("should not update state after component unmounts during initialization", async () => {
      let resolveClientCreate: (value: unknown) => void;
      const clientCreatePromise = new Promise((resolve) => {
        resolveClientCreate = resolve;
      });

      const { namespace: mockNamespace, mockClientInstance } =
        createMockBraintreeNamespace();
      (mockNamespace.client.create as jest.Mock).mockReturnValue(
        clientCreatePromise,
      );

      const { state, TestComponent } = setupTestComponent();

      let unmount: () => void;
      await act(async () => {
        const result = render(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken={TEST_CLIENT_TOKEN}
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
        unmount = result.unmount;
      });

      expectPendingState(state);

      unmount!();

      await act(async () => {
        resolveClientCreate!(mockClientInstance);
      });

      // State should still be pending since component unmounted
      await waitFor(
        () => {
          expectPendingState(state);
          expect(state.braintreePayPalCheckoutInstance).toBe(null);
        },
        { timeout: 500 },
      );
    });
  });

  describe("Teardown", () => {
    test("should call teardown on the checkout instance when the provider unmounts", async () => {
      const { namespace: mockNamespace, mockPayPalCheckoutInstance } =
        createMockBraintreeNamespace();

      const { state, TestComponent } = setupTestComponent();

      let unmount: () => void;
      await act(async () => {
        const result = render(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken={TEST_CLIENT_TOKEN}
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
        unmount = result.unmount;
      });

      await waitFor(() => expectResolvedState(state));

      await act(async () => {
        unmount!();
      });

      expect(mockPayPalCheckoutInstance.teardown).toHaveBeenCalledTimes(1);
    });

    test("should call teardown on the old instance when props change triggers re-initialization", async () => {
      const { namespace: mockNamespace, mockPayPalCheckoutInstance } =
        createMockBraintreeNamespace();

      const { state, TestComponent } = setupTestComponent();
      let rerender: ReturnType<typeof render>["rerender"];

      await act(async () => {
        const result = render(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken={TEST_CLIENT_TOKEN}
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
        rerender = result.rerender;
      });

      await waitFor(() => expectResolvedState(state));

      expect(mockPayPalCheckoutInstance.teardown).not.toHaveBeenCalled();

      await act(async () => {
        rerender!(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken="new-client-token"
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
      });

      expect(mockPayPalCheckoutInstance.teardown).toHaveBeenCalledTimes(1);
    });
  });

  describe("Hydration", () => {
    test("should set isHydrated to true after initial render", async () => {
      const { state } = await renderProvider();

      await waitFor(() => {
        expect(state.isHydrated).toBe(true);
      });
    });
  });

  describe("Props Changes", () => {
    test("should re-initialize when braintreeClientToken changes", async () => {
      const { namespace: mockNamespace } = createMockBraintreeNamespace();

      const { state, TestComponent } = setupTestComponent();
      let rerender: ReturnType<typeof render>["rerender"];

      await act(async () => {
        const result = render(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken={TEST_CLIENT_TOKEN}
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
        rerender = result.rerender;
      });

      await waitFor(() => expectResolvedState(state));
      const initialCallCount = (mockNamespace.client.create as jest.Mock).mock
        .calls.length;

      await act(async () => {
        rerender!(
          <BraintreePayPalProvider
            namespace={mockNamespace}
            braintreeClientToken="new-client-token"
          >
            <TestComponent />
          </BraintreePayPalProvider>,
        );
      });

      await waitFor(() =>
        expect(
          (mockNamespace.client.create as jest.Mock).mock.calls.length,
        ).toBe(initialCallCount + 1),
      );

      expect(mockNamespace.client.create).toHaveBeenLastCalledWith({
        authorization: "new-client-token",
      });
    });
  });
});
