import type { PayPalButtonsComponentProps } from "./paypalButtonTypes";
import {
    CreateOrderActions,
    OnApproveActions,
} from "@paypal/paypal-js/types/components/buttons";
import type { BraintreeClient } from "./braintree/clientTypes";
import type {
    BraintreePayPalCheckout,
    BraintreePayPalCheckoutTokenizationOptions,
} from "./braintree/paypalCheckout";

export type CreateOrderBraintreeActions = CreateOrderActions & {
    braintree: BraintreePayPalCheckout;
};

export type OnApproveBraintreeActions = OnApproveActions & {
    braintree: BraintreePayPalCheckout;
};

export type OnApproveBraintreeData = BraintreePayPalCheckoutTokenizationOptions;

export interface BraintreePayPalButtonsComponentProps
    extends Omit<PayPalButtonsComponentProps, "createOrder" | "onApprove"> {
    /**
     * The createOrder actions include the braintree sdk paypalCheckoutInstance as `actions.braintree`
     */
    createOrder?: (
        data: Record<string, unknown>,
        actions: CreateOrderBraintreeActions
    ) => Promise<string>;
    /**
     * The onApprove actions include the braintree sdk paypalCheckoutInstance as `actions.braintree`
     */
    onApprove?: (
        data: OnApproveBraintreeData,
        actions: OnApproveBraintreeActions
    ) => Promise<void>;
}

export type BraintreeNamespace = {
    client: BraintreeClient;
    paypalCheckout: BraintreePayPalCheckout;
};
