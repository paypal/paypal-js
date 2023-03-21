import type { Address, AmountWithCurrencyCode } from "./commons";
// https://developer.paypal.com/docs/api/orders/v2/#orders-create-request-body
// https://developer.paypal.com/docs/api/orders/v2/#orders-capture-response

export interface AmountWithCurrencyCodeOptional {
    /** The [three-character ISO-4217 currency code](/docs/integration/direct/rest/currency-codes/) that identifies the currency. */
    currency_code?: string;
    /**
     * The value, which might be:
     * - An integer for currencies like `JPY` that are not typically fractional.
     * - A decimal fraction for currencies like `TND` that are subdivided into thousandths.
     *
     * For the required number of decimal places for a currency code, see [Currency Codes](/docs/integration/direct/rest/currency-codes/).
     */
    value: string;
}

export type SHIPPING_PREFERENCE =
    | "GET_FROM_FILE"
    | "NO_SHIPPING"
    | "SET_PROVIDED_ADDRESS";

/**
 * The customer who approves and pays for the order.
 * The customer is also known as the payer
 */
export type Payer = {
    /**
     * The name of the party
     */
    name: Partial<{
        /**
         * When the party is a person, the party's given, or first, name
         * @maxLength 140
         */
        given_name: string;
        /**
         * When the party is a person, the party's surname or family name.
         * Also known as the last name.
         * Required when the party is a person.
         * Use also to store multiple surnames including the matronymic, or mother's, surname
         * @maxLength 140
         */
        surname: string;
    }>;
    email_address: string;
    /**
     * The account identifier for a PayPal account.
     */
    payer_id: string;
    phone: {
        phone_type?: string;
        phone_number: {
            national_number: string;
        };
    };
    birth_date: string;
    /**
     * The tax ID of the customer. The customer is also known as the payer. Both `tax_id` and `tax_id_type` are required
     */
    tax_info: {
        /**
         * The customer's tax ID value
         */
        tax_id: string;
        /**
         * The customer's tax ID type
         */
        tax_id_type: string;
    };
    address: Address;
    /**
     * The payer's tenant id.
     * For a Venmo user who gave consent for BA on Venmo app, this would be VENMO
     * @readonly
     */
    tenant: string;
};

export type Payee = {
    merchant_id?: string;
    email_address?: string;
};

export interface AmountWithBreakdown extends AmountWithCurrencyCodeOptional {
    breakdown?: {
        item_total?: AmountWithCurrencyCode;
        shipping?: AmountWithCurrencyCode;
        handling?: AmountWithCurrencyCode;
        tax_total?: AmountWithCurrencyCode;
        insurance?: AmountWithCurrencyCode;
        shipping_discount?: AmountWithCurrencyCode;
        discount?: AmountWithCurrencyCode;
    };
}

export type PlatformFee = {
    amount: AmountWithCurrencyCodeOptional;
    payee?: Payee;
};

export type PaymentInstruction = {
    platform_fees: PlatformFee[];
    disbursement_mode: "INSTANT" | "DELAYED";
};

export type ShippingInfoOption = {
    /**
     * A unique ID that identifies a payer-selected shipping option
     * @maxLength 127
     */
    id: string;
    /**
     * A description that the payer sees, which helps them choose an appropriate shipping option.
     */
    label: string;
    /**
     * The method by which the payer wants to get their items
     */
    type?: string;
    /**
     * The currency and amount for a financial transaction,
     * such as a balance or payment due
     */
    amount?: Partial<AmountWithCurrencyCode>;
    /**
     * If the API request sets `selected = true`, it represents the shipping option
     * that the payee or merchant expects to be pre-selected for the payer when
     * they first view the `shipping.options` in the PayPal Checkout experience.
     * As part of the response if a `shipping.option` contains `selected=true`,
     * it represents the shipping option that the payer selected during
     * the course of checkout with PayPal.
     * Only one `shipping.option` can be set to `selected=true`.
     */
    selected: boolean;
};

interface ShippingInfoBase {
    /**
     * The name of the party
     */
    name?: Partial<{
        /**
         * When the party is a person, the party's full name
         */
        full_name: string;
    }>;
    email_address?: string;
    phone_number?: {
        /**
         * The national number, in its canonical international [E.164 numbering plan format](https://www.itu.int/rec/T-REC-E.164/en).
         * The combined length of the country calling code (CC) and the national number must not be greater than 15 digits.
         * The national number consists of a national destination code (NDC) and subscriber number (SN).
         */
        national_number: string;
    };
    address?: Address;
}

interface ShippingInfoWithType extends ShippingInfoBase {
    type: "SHIPPING" | "PICKUP_IN_PERSON";
    options?: never;
}

interface ShippingInfoWithOptions extends ShippingInfoBase {
    options: ShippingInfoOption[];
    type?: never;
}

export type ShippingInfo = ShippingInfoWithType | ShippingInfoWithOptions;

export type PurchaseItem = {
    name: string;
    quantity: string;
    unit_amount: AmountWithCurrencyCodeOptional;
    tax?: AmountWithCurrencyCodeOptional;
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

/**
 * The intent to either capture payment immediately or authorize a payment for an order after order creation.
 * @type {CAPTURE} The merchant intends to capture payment immediately after the customer makes a payment
 * @type {AUTHORIZE} The merchant intends to authorize a payment and place funds on hold after the customer makes a payment.
 */
export type INTENT = "CAPTURE" | "AUTHORIZE";

export type CreateOrderRequestBody = {
    intent?: INTENT;
    purchase_units: PurchaseUnit[];
    payer?: Payer;
    application_context?: OrderApplicationContext;
};

export type OrderResponseBodyMinimal = {
    /**
     * The ID of the order
     * @readonly
     */
    id: string;
    /**
     * The order status
     */
    status:
        | "CREATED"
        | "SAVED"
        | "APPROVED"
        | "VOIDED"
        | "COMPLETED"
        | "PAYER_ACTION_REQUIRED";
    /**
     * An array of request-related HATEOAS links
     */
    links: LinkDescription[];
};

export type OrderResponseBody = OrderResponseBodyMinimal & {
    /**
     * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6).
     * Seconds are required while fractional seconds are optional
     * @minLength 20
     * @maxLength 64
     */
    create_time: string;
    /**
     * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6).
     * Seconds are required while fractional seconds are optional
     * @minLength 20
     * @maxLength 64
     */
    update_time: string;
    /**
     * @type {INTENT}
     */
    intent: INTENT;
    /**
     * @type {Payer}
     */
    payer: Partial<Payer>;
    purchase_units: PurchaseUnit[];
    /**
     * The instruction to process an order
     */
    processing_instruction?: string;
    /**
     * The payment source used to fund the payment
     */
    payment_source?: { [key: string]: unknown };
    /**
     * The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6).
     * Seconds are required while fractional seconds are optional
     */
    expiration_time?: string;
    /**
     * The details about the payer-selected credit financing offer
     */
    credit_financing_offer?: Partial<{
        /**
         * The issuer of the credit financing offer
         */
        issuer: "Paypal" | "CARD_ISSUER_INSTALLMENTS";
        /**
         * The currency and amount for a financial transaction, such as a balance or payment due
         */
        total_payment: Partial<AmountWithCurrencyCode>;
        /**
         * The currency and amount for a financial transaction, such as a balance or payment due
         */
        total_interest: Partial<AmountWithCurrencyCode>;
        /**
         * The payer-approved installment payment plan details
         */
        installment_details: Partial<{
            /**
             * The frequency with which the payer has agreed to make the payment
             */
            period: string;
            interval_duration: string;
            payment_due: Partial<AmountWithCurrencyCode>;
        }>;
        /**
         * The payer-selected financing term, in months
         */
        term: number;
    }>;
};
