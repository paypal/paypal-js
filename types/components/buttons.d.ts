import type { CreateOrderRequestBody } from '../apis/orders';
import type { CreateSubscriptionRequestBody } from '../apis/subscriptions';


type UnknownObject = Record<string, unknown>;

type CreateOrderActions = {
    order: {
        create: (options: CreateOrderRequestBody) => Promise<string>;
    }
};

type CreateSubscriptionActions = {
    subscription: {
        create: (options: CreateSubscriptionRequestBody) => Promise<string>;
    }
};

type OnInitActions = {
    enable: () => void;
    disable: () => void;
};

type OnClickActions = {
    reject: () => void;
    resolve: () => void;
};

type OnApproveOrderActions = {
    order: {
        capture: (options: UnknownObject) => Promise<UnknownObject>;
    }
};

type OnCancelledOrderData = {
    orderID: string;
};

type OnCancelledOrderActions = {
    redirect: () => void;
};

export interface PayPalButtonsComponentProps {
    createBillingAgreement?: () => Promise<string>;
    createOrder?: (data: UnknownObject, actions: CreateOrderActions) => Promise<string>;
    createSubscription?: (data: UnknownObject, actions: CreateSubscriptionActions) => Promise<string>;

    fundingSource?: string;

    onApprove?: (data: UnknownObject, actions: OnApproveOrderActions) => Promise<void>;
    onCancel?: (data: UnknownObject, actions: OnCancelledOrderActions) => void;
    onClick?: (data: UnknownObject, actions: OnClickActions) => Promise<void> | void;
    onError?: () => void;
    onInit?: (data: UnknownObject, actions: OnInitActions) => void;
    onShippingChange?: () => void;

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
