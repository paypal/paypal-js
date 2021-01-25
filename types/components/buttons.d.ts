import type { CreateOrderRequestBody } from '../apis/orders';
import type { CreateSubscriptionRequestBody } from '../apis/subscriptions';


type CreateOrderData = Record<string, unknown>;

type CreateOrderActions = {
    order: {
        create: (options: CreateOrderRequestBody) => Promise<string>;
    }
};

type CreateSubscriptionData = Record<string, unknown>;

type CreateSubscriptionActions = {
    subscription: {
        create: (options: CreateSubscriptionRequestBody) => Promise<string>;
    }
};

type OnApproveOrderData = Record<string, unknown>;

type OnApproveOrderActions = {
    order: {
        capture: (options: Record<string, unknown>) => Promise<Record<string, unknown>>;
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
    createOrder?: (data: CreateOrderData, actions: CreateOrderActions) => Promise<string>;
    createSubscription?: (data: CreateSubscriptionData, actions: CreateSubscriptionActions) => Promise<string>;

    fundingSource?: string;

    onApprove?: (data: OnApproveOrderData, actions: OnApproveOrderActions) => Promise<void>;
    onCancel?: (data: OnCancelledOrderData, actions: OnCancelledOrderActions) => void;
    onClick?: () => void;
    onError?: () => void;
    onInit?: () => void;
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
