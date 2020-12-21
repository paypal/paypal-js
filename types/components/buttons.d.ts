import type { CreateOrderRequestBody } from '../apis/orders';

type CreateOrderData = Record<string, unknown>;

type CreateOrderActions = {
    order: {
        create: (options: CreateOrderRequestBody) => Promise<string>;
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
    createOrder?: (data: CreateOrderData, actions: CreateOrderActions) => Promise<string>;
    createSubscription?: (data: Record<string, unknown>, actions: Record<string, unknown>) => void;

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
