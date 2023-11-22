import type {
    CreateOrderRequestBody,
    OrderResponseBody,
    UpdateOrderRequestBody,
} from "../apis/orders";
import type {
    CreateSubscriptionRequestBody,
    ReviseSubscriptionRequestBody,
} from "../apis/subscriptions/subscriptions";
import type { ShippingAddress, SelectedShippingOption } from "../apis/shipping";
import type { SubscriptionDetail } from "../apis/subscriptions/subscriptions";
import type { FUNDING_SOURCE } from "./funding-eligibility";

export type CreateOrderData = {
    paymentSource: FUNDING_SOURCE;
};

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
        /** Used to revise an existing subscription for client-side integrations. Accepts the same options as the request body of the [/v1/billing/subscription/{id}/revise api](https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions_revise). */
        revise: (
            subscriptionID: string,
            options: ReviseSubscriptionRequestBody,
        ) => Promise<string>;
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
    order?: {
        /**
         * Captures payment for an order.
         * To successfully capture payment for an order,the buyer must first
         * approve the order or a valid `payment_source` must be provided in the request
         */
        capture: () => Promise<OrderResponseBody>;
        /**
         * Authorizes payment for an order.
         * To successfully authorize payment for an order,
         * the buyer must first approve the order or a valid payment_source must be provided in the request
         */
        authorize: () => Promise<OrderResponseBody>;
        /**
         * Shows details for an order, by ID
         */
        get: () => Promise<OrderResponseBody>;
        /**
         * Updates an order with a `CREATED` or `APPROVED` status.
         * You cannot update an order with the `COMPLETED` status
         */
        patch: () => Promise<void>;
    };
    subscription?: {
        get: () => Promise<SubscriptionDetail>;
        activate: () => Promise<void>;
    };
    redirect: (redirectURL: string) => void;
    restart: () => void;
};

export type OnCancelledActions = {
    redirect: () => void;
};

export type OnShippingChangeData = {
    orderID?: string;
    paymentID?: string;
    paymentToken?: string;
    shipping_address?: ShippingAddress;
    selected_shipping_option?: SelectedShippingOption;
    buyerAccessToken?: string;
    forceRestAPI: boolean;
};

export type OnShippingChangeActions = {
    resolve: () => Promise<void>;
    reject: () => Promise<void>;
    order: {
        patch: (options: UpdateOrderRequestBody) => Promise<void>;
    };
};

type CurrencyCodeAndValue = {
    currencyCode: string;
    value: string;
};

type CheckoutShippingOption = {
    amount: CurrencyCodeAndValue;
    id?: string;
    label: string;
    selected: boolean;
    type: "SHIPPING" | "PICKUP";
};

type OnShippingOptionsChangeData = {
    orderID?: string;
    paymentID?: string;
    paymentToken?: string;
    selectedShippingOption?: CheckoutShippingOption;
};

type BuildOrderPatchPayloadArgs = {
    discount?: string;
    handling?: string;
    insurance?: string;
    itemTotal?: string;
    option?: CheckoutShippingOption;
    shippingDiscount?: string;
    taxTotal?: string;
};

type OnShippingOptionsChangeBuildOrderPatchPayloadArgs =
    BuildOrderPatchPayloadArgs & {
        shippingOption?: CheckoutShippingOption;
    };

type OnShippingAddressChangeBuildOrderPatchPayloadArgs =
    BuildOrderPatchPayloadArgs & {
        shippingOptions?: CheckoutShippingOption[];
    };

type OnShippingOptionsChangeActions = {
    buildOrderPatchPayload: ({
        discount,
        handling,
        insurance,
        itemTotal,
        shippingOption,
        shippingDiscount,
        taxTotal,
    }: OnShippingOptionsChangeBuildOrderPatchPayloadArgs) => UpdateOrderRequestBody;
    reject: () => Promise<void>;
};

type OnShippingAddressChangeData = {
    amount: CurrencyCodeAndValue;
    orderID?: string;
    paymentID?: string;
    paymentToken?: string;
    shippingAddress: {
        city: string;
        state: string;
        /** The [two-character ISO 3166-1 code](/docs/integration/direct/rest/country-codes/) that identifies the country or region. */
        countryCode: string;
        /**
         * The postal code, which is the zip code or equivalent.
         * Typically required for countries with a postal code or an equivalent.
         */
        postalCode: string;
    };
};

type OnShippingAddressChangeActions = {
    buildOrderPatchPayload: ({
        discount,
        handling,
        insurance,
        itemTotal,
        shippingOptions,
        shippingDiscount,
        taxTotal,
    }: OnShippingAddressChangeBuildOrderPatchPayloadArgs) => UpdateOrderRequestBody;
    reject: () => Promise<void>;
};

export type DisplayOnlyOptions = "vaultable";

export interface PayPalButtonsComponentOptions {
    /**
     * Called on button click. Often used for [Braintree vault integrations](https://developers.braintreepayments.com/guides/paypal/vault/javascript/v3).
     */
    createBillingAgreement?: () => Promise<string>;
    /**
     * Called on button click to set up a one-time payment. [createOrder docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#createorder).
     */
    createOrder?: (
        data: CreateOrderData,
        actions: CreateOrderActions,
    ) => Promise<string>;
    /**
     * Called on button click to set up a recurring payment. [createSubscription docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#createsubscription).
     */
    createSubscription?: (
        data: Record<string, unknown>,
        actions: CreateSubscriptionActions,
    ) => Promise<string>;
    /**
     * Save payment methods to charge payers after a set amount of time. For example, you can offer a free trial and charge payers after the trial expires. Payers don't need to be present when charged. No checkout required.
     * https://developer.paypal.com/docs/checkout/save-payment-methods/purchase-later/js-sdk/paypal/#link-clientsidecodesample
     */
    createVaultSetupToken?: () => Promise<string>;
    /**
     * Used for defining a standalone button.
     * Learn more about [configuring the funding source for standalone buttons](https://developer.paypal.com/docs/business/checkout/configure-payments/standalone-buttons/#4-funding-sources).
     */
    fundingSource?: FUNDING_SOURCE;
    /**
     * Called when finalizing the transaction. Often used to inform the buyer that the transaction is complete. [onApprove docs](https://developer.paypal.com/docs/business/javascript-sdk/javascript-sdk-reference/#onapprove).
     */
    onApprove?: (
        data: OnApproveData,
        actions: OnApproveActions,
    ) => Promise<void>;
    /**
     * Called when the buyer cancels the transaction.
     * Often used to show the buyer a [cancellation page](https://developer.paypal.com/docs/business/checkout/add-capabilities/buyer-experience/#3-show-cancellation-page).
     */
    onCancel?: (
        data: Record<string, unknown>,
        actions: OnCancelledActions,
    ) => void;
    /**
     * Called when the button is clicked. Often used for [validation](https://developer.paypal.com/docs/checkout/integration-features/validation/).
     */
    onClick?: (
        data: Record<string, unknown>,
        actions: OnClickActions,
    ) => Promise<void> | void;
    /**
     * Catch all for errors preventing buyer checkout.
     * Often used to show the buyer an [error page](https://developer.paypal.com/docs/checkout/integration-features/handle-errors/).
     */
    onError?: (err: Record<string, unknown>) => void;
    /**
     * Called when the buttons are initialized. The component is initialized after the iframe has successfully loaded.
     */
    onInit?: (data: Record<string, unknown>, actions: OnInitActions) => void;
    /**
     * Called when the buyer changes their shipping address on PayPal.
     * @deprecated Use `onShippingAddressChange` or `onShippingOptionsChange` instead.
     */
    onShippingChange?: (
        data: OnShippingChangeData,
        actions: OnShippingChangeActions,
    ) => Promise<void>;
    /**
     * Called when the buyer selects a new shipping option on PayPal.
     */
    onShippingOptionsChange?: (
        data: OnShippingOptionsChangeData,
        actions: OnShippingOptionsChangeActions,
    ) => Promise<void>;
    /**
     * Called when the buyer updates their shipping address on PayPal.
     */
    onShippingAddressChange?: (
        data: OnShippingAddressChangeData,
        actions: OnShippingAddressChangeActions,
    ) => Promise<void>;
    /**
     * [Styling options](https://developer.paypal.com/docs/business/checkout/reference/style-guide/#customize-the-payment-buttons) for customizing the button appearance.
     */
    style?: {
        color?: "gold" | "blue" | "silver" | "white" | "black";
        disableMaxWidth?: boolean;
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
    /**
     * Used for displaying only vaultable buttons.
     */
    displayOnly?: DisplayOnlyOptions[];
}

export interface PayPalButtonsComponent {
    close: () => Promise<void>;
    isEligible: () => boolean;
    render: (container: HTMLElement | string) => Promise<void>;
}
