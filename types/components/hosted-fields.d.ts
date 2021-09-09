import type { CreateOrderRequestBody } from "../apis/orders";

type UnknownObject = Record<string, unknown>;

export type CreateOrderActions = {
    order: {
        create: (options: CreateOrderRequestBody) => Promise<string>;
    };
};

export interface PayPalHostedFieldsComponentOptions {
    createOrder: () => Promise<string>;
    onError?: (err: UnknownObject) => void;
    styles?: UnknownObject;
    fields?: UnknownObject;
}

export interface HostedFieldsPaymentMethodValidated {
    orderId: string;
    liabilityShift: unknown;
    liabilityShifted: unknown;
    authenticationReason: unknown;
    authenticationStatus: unknown;
    card: {
        brand: string;
        card_type: string;
        last_digits: string;
        type: string;
    }
}

export interface HostedFieldsHandler {
    submit: (options?: UnknownObject) => Promise<HostedFieldsPaymentMethodValidated>;
    getCardTypes: () => UnknownObject;
}

export interface PayPalHostedFieldsComponent {
    isEligible: () => boolean;
    render: (
        options: PayPalHostedFieldsComponentOptions
    ) => Promise<HostedFieldsHandler>;
}
