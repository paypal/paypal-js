import type { CreateOrderRequestBody, CaptureOrderResponseBody } from '../apis/orders';
import type { CreateSubscriptionRequestBody } from '../apis/subscriptions';

type UnknownObject = Record<string, unknown>;

export type CreateOrderActions = {
    order: {
        /** Used to create an order for client-side integrations. Accepts the same options as the request body of the [/v2/checkout/orders api](https://developer.paypal.com/docs/api/orders/v2/#orders-create-request-body). */
        create: (options: CreateOrderRequestBody) => Promise<string>;
    }
};

export type CreateSubscriptionActions = {
    subscription: {
        /** Used to create a subscription for client-side integrations. Accepts the same options as the request body of the [/v1/billing/subscription api](https://developer.paypal.com/docs/api/subscriptions/v1#subscriptions-create-request-body). */
        create: (options: CreateSubscriptionRequestBody) => Promise<string>;
    }
};

export type OnInitActions = {
    enable: () => void;
    disable: () => void;
};

export type OnClickActions = {
    reject: () => void;
    resolve: () => void;
};

// todo: what else is possible here?
export type OnApproveOrderActions = {
    order: {
        capture: () => Promise<CaptureOrderResponseBody>;
        redirect: (redirectURL: string) => void;
        restart: () => void;

    }
};

export type OnCancelledOrderData = {
    orderID: string;
};

export type OnCancelledOrderActions = {
    redirect: () => void;
};

export interface PayPalButtonsComponentProps {
    /**
     * Called on button click. Often used for [Braintree vault integrations](https://developers.braintreepayments.com/guides/paypal/vault/javascript/v3).
     */
    createBillingAgreement?: () => Promise<string>;
    /**
     * Called on button click. Supports creating an order with the [/v2/checkout/orders api](https://developer.paypal.com/docs/api/orders/v2/#orders_create).
     */
    createOrder?: (data: UnknownObject, actions: CreateOrderActions) => Promise<string>;
    /**
     * Called on button click. Supports creating a subscription with the [/v1/billing/subscription api](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_create).
     */
    createSubscription?: (data: UnknownObject, actions: CreateSubscriptionActions) => Promise<string>;
    /**
     * Used for defining a standalone button.
     * Learn more about [configuring the funding source for standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#4-funding-sources).
     */
    fundingSource?: string;
    /**
     * Called when finalizing the transaction. Supports capturing an order with the [v2/checkout/orders/:order_id/capture api](https://developer.paypal.com/docs/api/orders/v2/#orders_capture).
     */
    onApprove?: (data: UnknownObject, actions: OnApproveOrderActions) => Promise<void>;
    /**
     * Called when the buyer cancels the transaction.
     * Often used to show the buyer a [cancellation page](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#3-show-cancellation-page).
     */
    onCancel?: (data: UnknownObject, actions: OnCancelledOrderActions) => void;
    /**
     * Called when the button is clicked. Often used for [validation](https://developer.paypal.com/docs/checkout/integration-features/validation/).
     */
    onClick?: (data: UnknownObject, actions: OnClickActions) => Promise<void> | void;
    /**
     * Catch all for errors preventing buyer checkout.
     * Often used to show the buyer an [error page](https://developer.paypal.com/docs/checkout/integration-features/handle-errors/).
     */
    onError?: (err: UnknownObject) => void;
    /**
     * Called when the buttons are initialized. The component is initialized after the iframe has successfully loaded.
     */
    onInit?: (data: UnknownObject, actions: OnInitActions) => void;
    /**
     * Called when the buyer changes their shipping address on PayPal.
     */
    onShippingChange?: () => void;
    /**
     * [Styling options](https://developer.paypal.com/docs/business/checkout/reference/style-guide/#customize-the-payment-buttons) for customizing the button appearance.
     */
    style?: {
        color?: "gold" | "blue" | "silver" | "white" | "black";
        height?: number;
        label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
        layout?: "vertical" | "horizontal";
        shape?: "rect" | "pill";
        tagline?: boolean;
    };
}

export interface PayPalButtonsComponent {
    close: () => Promise<void>;
    isEligible: () => boolean;
    render: (container: HTMLElement | string) => Promise<void>;
}
