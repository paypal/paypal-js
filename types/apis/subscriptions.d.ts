// https://developer.paypal.com/docs/api/subscriptions/v1/#subscriptions-create-request-body

interface ShippingAmount {
    currency_code: string;
    value: string;
}

type UntypedObject = Record<string, any>;

export type CreateSubscriptionRequestBody = {
    plan_id: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: ShippingAmount;
    subscriber?: UntypedObject;
    auto_renewal?: boolean;
    application_context?: UntypedObject;
    custom_id?: string;
    plan?: UntypedObject;
}
