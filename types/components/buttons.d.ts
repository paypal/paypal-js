import type { CreateOrderRequestBody, OrderResponseBody } from "../apis/orders";
import type { CreateSubscriptionRequestBody } from "../apis/subscriptions";

type UnknownObject = Record<string, unknown>;

export type CreateOrderActions = {
    order: {
        /** Used to create an order for client-side integrations. Accepts the same options as the request body of the [/v2/checkout/orders api](https://developer.paypal.com/docs/api/orders/v2/#orders-create-request-body). */
        create: (options: CreateOrderRequestBody) => Promise<string>;
    };
};

export type CreateSubscriptionActions = {
    subscription: {
        /** Used to create a subscription for client-side integrations. Accepts the same options as the request body of the [/v1/billing/subscription api](https://developer.paypal.com/docs/api/subscriptions/v1#subscriptions-create-request-body). */
        create: (options: CreateSubscriptionRequestBody) => Promise<string>;
    };
};

export type OnInitActions = {
    enable: () => Promise<void>;
    disable: () => Promise<void>;
};

export type OnClickActions = {
    reject: () => Promise<void>;
    resolve: () => Promise<void>;
};

export type OnApproveData = {
    billingToken?: string | null;
    facilitatorAccessToken: string;
    orderID: string;
    payerID?: string | null;
    paymentID?: string | null;
    subscriptionID?: string | null;
    authCode?: string | null;
};

export type OnApproveActions = {
    order: {
        capture: () => Promise<OrderResponseBody>;
        authorize: () => Promise<OrderResponseBody>;
    };
    redirect: (redirectURL: string) => void;
    restart: () => void;
};

export type OnCancelledActions = {
    redirect: () => void;
};

export interface PayPalButtonsComponentOptions {
    /**
     * Called on button click. Often used for [Braintree vault integrations](https://developers.braintreepayments.com/guides/paypal/vault/javascript/v3).
     */
    createBillingAgreement?: () => Promise<string>;
    /**
     * Called on button click to set up a one-time payment. [createOrder docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#createorder).
     */
    createOrder?: (
        data: UnknownObject,
        actions: CreateOrderActions
    ) => Promise<string>;
    /**
     * Called on button click to set up a recurring payment. [createSubscription docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#createsubscription).
     */
    createSubscription?: (
        data: UnknownObject,
        actions: CreateSubscriptionActions
    ) => Promise<string>;
    /**
     * Used for defining a standalone button.
     * Learn more about [configuring the funding source for standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#4-funding-sources).
     */
    fundingSource?: string;
    /**
     * Called when finalizing the transaction. Often used to inform the buyer that the transaction is complete. [onApprove docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#onapprove).
     */
    onApprove?: (
        data: OnApproveData,
        actions: OnApproveActions
    ) => Promise<void>;
    /**
     * Called when the buyer cancels the transaction.
     * Often used to show the buyer a [cancellation page](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#3-show-cancellation-page).
     */
    onCancel?: (data: UnknownObject, actions: OnCancelledActions) => void;
    /**
     * Called when the button is clicked. Often used for [validation](https://developer.paypal.com/docs/checkout/integration-features/validation/).
     */
    onClick?: (
        data: UnknownObject,
        actions: OnClickActions
    ) => Promise<void> | void;
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
        label?:
            | "paypal"
            | "checkout"
            | "buynow"
            | "pay"
            | "installment"
            | "subscribe"
            | "donate";
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
