import type { CreateOrderRequestBody } from "../apis/orders";

type UnknownObject = Record<string, unknown>;

export type CreateOrderActions = {
    order: {
        create: (options: CreateOrderRequestBody) => Promise<string>;
    };
};

export interface PayPalHostedFieldsComponentOptions {
    createOrder?: (
        data: UnknownObject,
        actions: CreateOrderActions
    ) => Promise<string>;
    onError?: (err: UnknownObject) => void;
    styles?: UnknownObject;
    fields?: UnknownObject;
}

export interface HostedFieldsHandler {
    submit: (options?: UnknownObject) => Promise<void>;
    getCardTypes: () => UnknownObject;
}

export interface PayPalHostedFieldsComponent {
    isEligible: () => boolean;
    render: (
        options: PayPalHostedFieldsComponentOptions
    ) => Promise<HostedFieldsHandler>;
}
