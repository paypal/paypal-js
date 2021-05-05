// https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions-create-request-body

export interface ShippingAmount {
    currency_code: string;
    value: string;
}

type UnknownObject = Record<string, unknown>;

export type CreateSubscriptionRequestBody = {
    plan_id: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: ShippingAmount;
    subscriber?: UnknownObject;
    auto_renewal?: boolean;
    application_context?: UnknownObject;
    custom_id?: string;
    plan?: UnknownObject;
};
