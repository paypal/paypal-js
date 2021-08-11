// https://developer.paypal.com/docs/api/orders/v2/#orders-create-request-body
// https://developer.paypal.com/docs/api/orders/v2/#orders-capture-response

export type SHIPPING_PREFERENCE =
    | "GET_FROM_FILE"
    | "NO_SHIPPING"
    | "SET_PROVIDED_ADDRESS";

export type Address = {
    address_line_1: string;
    address_line_2: string;
    admin_area_2: string;
    admin_area_1: string;
    postal_code: string;
    country_code: string;
};

export type Payer = {
    name: {
        given_name: string;
        surname: string;
    };
    email_address: string;
    payer_id: string;
    phone: {
        phone_number: string;
    };
    birth_date: string;
    tax_info: {
        tax_id: string;
        tax_id_type: string;
    };
    address: Address;
};

export type Payee = {
    merchant_id?: string;
    email_address?: string;
};

export interface Amount {
    currency_code?: string;
    value: string;
}

export interface AmountWithRequiredCurrencyCode {
    currency_code: string;
    value: string;
}

export interface AmountWithBreakdown extends Amount {
    breakdown?: {
        item_total?: AmountWithRequiredCurrencyCode;
        shipping?: AmountWithRequiredCurrencyCode;
        handling?: AmountWithRequiredCurrencyCode;
        tax_total?: AmountWithRequiredCurrencyCode;
        insurance?: AmountWithRequiredCurrencyCode;
        shipping_discount?: AmountWithRequiredCurrencyCode;
        discount?: AmountWithRequiredCurrencyCode;
    };
}

export type PlatformFee = {
    amount: Amount;
    payee?: Payee;
};

export type PaymentInstruction = {
    platform_fees: PlatformFee[];
    disbursement_mode: "INSTANT" | "DELAYED";
};

export type ShippingInfo = {
    name: {
        full_name: string;
    };
    address: Address;
};

export type PurchaseItem = {
    name: string;
    quantity: string;
    unit_amount: Amount;
    tax?: Amount;
    description?: string;
    sku?: string;
    category?: "DIGITAL_GOODS" | "PHYSICAL_GOODS" | "DONATION";
};

type Authorization = Record<string, unknown>;
type Captures = Record<string, unknown>;
type Refunds = Record<string, unknown>;

export type Payments = {
    authorizations?: Authorization[];
    captures?: Captures[];
    refunds?: Refunds[];
};

export type PurchaseUnit = {
    amount: AmountWithBreakdown;
    reference_id?: string;
    description?: string;
    custom_id?: string;
    invoice_id?: string;
    soft_descriptor?: string;
    payee?: Payee;
    payment_instruction?: PaymentInstruction;
    shipping?: ShippingInfo;
    items?: PurchaseItem[];
    payments?: Payments;
};

export type OrderApplicationContext = {
    brand_name?: string;
    locale?: string;
    landing_page?: "LOGIN" | "BILLING" | "NO_PREFERENCE";
    shipping_preference?: SHIPPING_PREFERENCE;
    user_action?: "CONTINUE" | "PAY_NOW";
    payment_method?: Record<string, unknown>;
    return_url?: string;
    cancel_url?: string;
    stored_payment_source?: Record<string, unknown>;
};

export type LinkDescription = {
    href: string;
    rel: string;
    method?: string;
};

export type INTENT = "CAPTURE" | "AUTHORIZE";

export type CreateOrderRequestBody = {
    intent?: INTENT;
    purchase_units: PurchaseUnit[];
    payer?: Payer;
    application_context?: OrderApplicationContext;
};

export type OrderResponseBody = {
    create_time: string;
    update_time: string;
    id: string;
    intent: INTENT;
    payer: Payer;
    purchase_units: PurchaseUnit[];
    status:
        | "COMPLETED"
        | "SAVED"
        | "APPROVED"
        | "VOIDED"
        | "COMPLETED"
        | "PAYER_ACTION_REQUIRED";
    links: LinkDescription[];
};

// deprecated - remove `CaptureOrderResponseBody` in next major release
export type CaptureOrderResponseBody = OrderResponseBody;
