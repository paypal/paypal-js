import type { AmountWithCurrencyCode, Address, Taxes, Card } from "../commons";
import type {
    Status,
    StatusChangedBy,
    PaymentStatus,
    ProductCode,
    API,
    Payment,
    PaymentFailureReason,
    ProductFeature,
    IntegrationArtifact,
    UserExperienceFlow,
    ProductFlow,
    ProductType,
    Category,
} from "./commons";
import type { ShippingOptionType } from "../shipping";

export type CreateSubscriptionRequestBody = {
    plan_id: string;
    start_time?: string;
    quantity?: string;
    shipping_amount?: AmountWithCurrencyCode;
    subscriber?: Record<string, unknown>;
    auto_renewal?: boolean;
    application_context?: Record<string, unknown>;
    custom_id?: string;
    plan?: Record<string, unknown>;
};

export type ReviseSubscriptionRequestBody = {
    application_context?: Record<string, unknown>;
    effective_time?: string;
    plan?: Record<string, unknown>;
    plan_id?: string;
    quantity?: string;
    shipping_address?: {
        name?: string;
        address?: Address;
    };
    shipping_amount?: AmountWithCurrencyCode;
};

/**
 * Contains all the information related to a subscription flow
 */
export type SubscriptionDetail = {
    resolve: boolean;
    rejected: boolean;
    errorHandled: boolean;
    handlers: Array<unknown>;
    dispatching: boolean;
    value: Partial<{
        /**
         * The PayPal-generated ID for the subscription.
         * @minLength 3
         * @maxLength 50
         */
        id: string;
        /**
         * Status of the subscription
         * @type STATUS
         */
        status: Status;
        /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6) */
        start_time: string;
        /** The reason or notes for the status of the subscription. */
        status_change_note: string;
        /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6) */
        status_update_time: string;
        /**
         * The last actor that updated the subscription.
         * @type STATUS_CHANGED_BY
         * */
        status_changed_by: StatusChangedBy;
        /**
         * The ID of the plan.
         * @minLength 3
         * @maxLength 50
         */
        plan_id: string;
        /**
         * The quantity of the product in the subscription.
         * @minLength 1
         * @maxLength 32
         */
        quantity: string;
        /** The currency and amount for a financial transaction, such as a balance or payment due. */
        shipping_amount?: AmountWithCurrencyCode;
        /** The merchant who receives the funds and fulfills the order. The merchant is also known as the payee. */
        payee: Partial<{
            /**
             * The internationalized email address.
             * @maxLength 254
             */
            email_address: string;
            /** The account identifier for a PayPal account.
             * @minLength 13
             * @maxLength 13
             */
            merchant_id: string;
            /**
             * The public ID for the payee- or merchant-created app.
             * Introduced to support use cases, such as BrainTree integration with PayPal,
             * where payee `email_address` or `merchant_id` is not available.
             * @maxLength 80
             */
            client_id: string;
            /** The merchant information. The merchant is also known as the payee.
             * Appears to the customer in checkout, transactions, email receipts, and transaction history. */
            display_data: Partial<{
                /**
                 * The internationalized email address.
                 * @maxLength 254
                 */
                business_email: string;
                business_phone: {
                    /** The country calling code (CC), in its canonical international */
                    country_code: string;
                    /**
                     * The national number, in its canonical international.
                     * @minLength 1
                     * @maxLength 14
                     */
                    national_number: string;
                    /**
                     * The extension number.
                     * @minLength 1
                     * @maxLength 15
                     */
                    extension_number?: string;
                };
                /**
                 * The name of the merchant. Appears to the customer in checkout, payment transactions, email receipts, and transaction history.
                 * @maxLength 127
                 */
                brand_name: string;
            }>;
        }>;
        /** The subscriber response information. */
        subscriber: Partial<{
            /**
             * The internationalized email address.
             * @maxLength 254
             */
            email_address: string;
            /** The account identifier for a PayPal account. */
            payer_id: string;
            /** The name of the party. */
            name: Partial<{
                /** When the party is a person, the party's given, or first, name. */
                given_name: string;
                /**
                 * When the party is a person, the party's surname or family name.
                 * Also known as the last name. Required when the party is a person.
                 * Use also to store multiple surnames including the matronymic, or mother's, surname.
                 */
                surname: string;
            }>;
            /** The phone information. */
            phone?: Partial<{
                /** The phone type. */
                phone_type: string;
                /** The phone number, in its canonical international */
                phone_number: string;
            }>;
            /** The shipping details. */
            shipping_address?: Partial<{
                /** The name of the party. */
                name?: {
                    /** When the party is a person, the party's full name. */
                    full_name?: string;
                };
                /** The method by which the payer wants to get their items from the payee e.g shipping,
                 * in-person pickup. Either type or options but not both may be present. */
                type?: string;
                /**
                 * An array of shipping options that the payee or merchant offers to the payer to ship or pick up their items.
                 * @maxItems 10
                 */
                options?: Array<{
                    /** A unique ID that identifies a payer-selected shipping option. */
                    id: string;
                    /** A description that the payer sees, which helps them choose an appropriate shipping option. */
                    label: string;
                    /** The method by which the payer wants to get their items. */
                    type?: ShippingOptionType;
                    amount?: AmountWithCurrencyCode;
                    /**
                     * If the API request sets `selected = true`, it represents the shipping option that the payee or merchant expects
                     * to be pre-selected for the payer when they first view the `shipping.options` in the PayPal Checkout experience.
                     * As part of the response if a `shipping.option` contains `selected=true`,
                     * it represents the shipping option that the payer selected during the course of checkout with PayPal.
                     * Only one `shipping.option` can be set to `selected=true`.
                     */
                    selected: boolean;
                }>;
                /** The portable international postal address. */
                address: Address;
            }>;
            /** The payment source used to fund the payment. */
            payment_source?: {
                /** The payment card used to fund the payment. Card can be a credit or debit card. */
                card?: Partial<Card>;
            };
        }>;
        /** The billing details for the subscription. If the subscription was or is active, these fields are populated. */
        billing_info: {
            /** The currency and amount for a financial transaction, such as a balance or payment due. */
            outstanding_balance: AmountWithCurrencyCode;
            cycle_executions?: Array<{
                /** The type of the billing cycle. */
                tenure_type: string;
                /** The order in which to run this cycle among other billing cycles. */
                sequence: number;
                /** The number of billing cycles that have completed. */
                cycles_completed: number;
                /**
                 * For a finite billing cycle, cycles_remaining is the number of remaining cycles.
                 * For an infinite billing cycle, cycles_remaining is set as 0.
                 */
                cycles_remaining?: number;
                /** The active pricing scheme version for the billing cycle. */
                current_pricing_scheme_version?: number;
                /** The currency and amount for a financial transaction, such as a balance or payment due. */
                amount_payable_per_cycle?: AmountWithCurrencyCode;
                /** The breakdown details for the amount. Includes the gross, tax, fee, and shipping amounts. */
                total_price_per_cycle?: {
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    gross_amount: AmountWithCurrencyCode;
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    total_item_amount?: AmountWithCurrencyCode;
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    fee_amount?: AmountWithCurrencyCode;
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    shipping_amount?: AmountWithCurrencyCode;
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    tax_amount?: AmountWithCurrencyCode;
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    net_amount?: AmountWithCurrencyCode;
                };
                /**
                 * The number of times this billing cycle gets executed.
                 * Trial billing cycles can only be executed a finite number of times (value between 1 and 999 for total_cycles)
                 */
                total_cycles?: number;
            }>;
            /** The details for the last payment. */
            last_payment?: {
                /** The status of the captured payment. */
                status?: PaymentStatus;
                /** The currency and amount for a financial transaction, such as a balance or payment due. */
                amount: AmountWithCurrencyCode;
                /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
                time: string;
                /** The sender side PayPal-generated transaction ID. */
                sender_transaction_id?: string;
                /** The receiver side PayPal-generated transaction ID. */
                receiver_transaction_id?: string;
            };
            /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6) */
            next_billing_time?: string;
            /** The currency and amount for a financial transaction, such as a balance or payment due. */
            next_payment?: AmountWithCurrencyCode;
            /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
            final_payment_time?: string;
            /**
             * The number of consecutive payment failures. Resets to `0` after a successful payment.
             * If this reaches the `payment_failure_threshold` value, the subscription updates to the `SUSPENDED` state.
             */
            failed_payments_count: number;
            /** The details for the failed payment of the subscription. */
            last_failed_payment?: {
                /** The currency and amount for a financial transaction, such as a balance or payment due. */
                amount: AmountWithCurrencyCode;
                /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
                time: string;
                /** The reason code for the payment failure. */
                reason_code?: PaymentFailureReason;
                /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
                next_payment_retry_time?: string;
            };
            /** The currency and amount for a financial transaction, such as a balance or payment due. */
            total_paid_amount?: AmountWithCurrencyCode;
            /** Time interval (in days) after which the future subscription billing cycles are affected with the new pricing change. */
            price_change_effective_after?: number;
        };
        /** @deprecated indicates whether the subscription auto-renews after the billing cycles complete. */
        auto_renewal: boolean;
        /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
        create_time: string;
        /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
        update_time: string;
        /** The list of currency conversion providers. */
        preferred_currency_conversion: "PAYPAL" | "VENDOR";
        /** The customer's funding instrument. Returned as a funding option to external entities. */
        preferred_funding_source: Partial<{
            card: Partial<Card>;
            bank_account: {
                /** The PayPal-generated ID for the bank account. */
                id: string;
                /** The last four digits of the bank account number. */
                last_n_chars: string;
                /** The name of the bank to which the account is linked. */
                bank_name: string;
                /** The type of bank account. */
                account_type?: string;
                /** The [two-character ISO 3166-1 code](/docs/integration/direct/rest/country-codes/) that identifies the country or region. */
                country_code: string;
            };
            credit: {
                /** The PayPal-generated ID for the credit instrument. */
                id: string;
                /** The credit sub-types. */
                type?: string;
            };
            balance: {
                /** The PayPal-generated ID for the Balance Funding Instrument. */
                id?: string;
            };
        }>;
        /** Client configuration that captures the product flows and specific experiences that a user completes a paypal transaction. */
        client_configuration: Partial<{
            /** Types of the payment acceptance solution. */
            product_code: ProductCode;
            /** A feature capturing variant of a generic product code, when applicable. */
            product_feature: ProductFeature;
            /** The primary api used to trigger the paypal transaction. */
            api: API;
            /** Identifier for the software that paypal has provided to enable the integration. */
            integration_artifact: IntegrationArtifact;
            experience: Partial<{
                /** The user experience flow for the PayPal transaction. */
                user_experience_flow: UserExperienceFlow;
                /** The payment method user chose to start the payment process. */
                entry_point: Payment;
                /** Payment method used to complete the transaction. This can sometimes be different than the entry point if user changed their mind during the checkout flow. */
                payment_method: Payment | "PAY_WITH_CRYPTO";
                /** The payment flow channel type. */
                channel: "WEB" | "MOBILE_WEB" | "MOBILE_APP" | "BATCH";
                /** The product flow type. */
                product_flow: ProductFlow;
            }>;
            /** The initiator product for current transaction. This object determines the layer through which the transaction is initiated. */
            initiator: {
                product_code?: "EXPRESS_CHECKOUT" | "WEBSITE_PAYMENTS_STANDARD";
            };
        }>;
        /**
         * Describes a JSON Web Token (JWT). The value is either an [Unsecured JWT](https://tools.ietf.org/html/rfc7519#section-6) or a Secured JWT.
         * A secured JWT is either a [JSON Web Signature](https://tools.ietf.org/html/rfc7515) or a [JSON Web Encryption](https://tools.ietf.org/html/rfc7516).
         */
        metadata: string;
        /** The custom id for the subscription. Can be invoice id. */
        custom_id: string;
        /** Indicates whether the subscription has overridden any plan attributes. */
        plan_overridden: boolean;
        /** The plan details. */
        plan: Partial<{
            /** The ID for the product. */
            product_id: string;
            /** The plan name. */
            name: string;
            /**
             * The detailed description of the plan.
             * @minLength 1
             * @maxLength 127
             */
            description: string;
            billing_cycles: Array<{
                /** The pricing scheme details. */
                pricing_scheme?: Partial<{
                    /** The version of the pricing scheme. */
                    version: number;
                    /** The status of the pricing scheme. */
                    status: "IN_PROGRESS" | "ACTIVE" | "INACTIVE";
                    /** The currency and amount for a financial transaction, such as a balance or payment due. */
                    fixed_price: AmountWithCurrencyCode;
                    /** The pricing model for tiered plan. The `tiers` parameter is required. */
                    pricing_model: "VOLUME" | "TIERED";
                    /** An array of pricing tiers which are used for billing volume/tiered plans. pricing_model field has to be specified. */
                    tiers: Array<{
                        /** The starting quantity for the tier. */
                        starting_quantity: string;
                        /** The ending quantity for the tier. Optional for the last tier. */
                        ending_quantity?: string;
                        /** The currency and amount for a financial transaction, such as a balance or payment due. */
                        amount: AmountWithCurrencyCode;
                    }>;
                    /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
                    create_time: string;
                    /** The date and time, in [Internet date and time format](https://tools.ietf.org/html/rfc3339#section-5.6). */
                    update_time: string;
                }>;
                /** The frequency of the billing cycle. */
                frequency: {
                    /** The interval at which the subscription is charged or billed. */
                    interval_unit:
                        | "DAY"
                        | "WEEK"
                        | "SEMI_MONTH"
                        | "MONTH"
                        | "YEAR";
                    /**
                     * The number of intervals after which a subscriber is billed.
                     * For example, if the `interval_unit` is `DAY` with an `interval_count` of  `2`,
                     * the subscription is billed once every two days.
                     */
                    interval_count: number;
                };
                /**
                 * The tenure type of the billing cycle.
                 * In case of a plan having trial cycle, only 2 trial cycles are allowed per plan.
                 */
                tenure_type: "REGULAR" | "TRIAL";
                /**
                 * The order in which this cycle is to run among other billing cycles.
                 * For example, a trial billing cycle has a `sequence` of `1` while a regular billing cycle has a `sequence` of `2`,
                 * so that trial cycle runs before the regular cycle.
                 */
                sequence: number;
                /**
                 * The number of times this billing cycle gets executed.
                 * Trial billing cycles can only be executed a finite number of times (value between 1 and 999 for total_cycles).
                 * Regular billing cycles can be executed infinite times (value of 0 for total_cycles)
                 * or a finite number of times (value between 1 and 999 for total_cycles).
                 */
                total_cycles?: number;
                /** The tax details. */
                taxes?: Taxes;
                /** The currency and amount for a financial transaction, such as a balance or payment due. */
                shipping_amount?: AmountWithCurrencyCode;
            }>;
            payment_preferences: Partial<{
                /** A pre or post paid service. */
                service_type: "PREPAID" | "POSTPAID";
                /** Indicates whether to automatically bill the outstanding amount in the next billing cycle. */
                auto_bill_outstanding: boolean;
                /** The currency and amount for a financial transaction, such as a balance or payment due. */
                setup_fee: AmountWithCurrencyCode;
                /** The action to take on the subscription if the initial payment for the setup fails. */
                setup_fee_failure_action: "CONTINUE" | "CANCEL";
                /**
                 * The maximum number of payment failures before a subscription is suspended.
                 * For example, if `payment_failure_threshold` is `2`,
                 * the subscription automatically updates to the `SUSPEND` state if two consecutive payments fail.
                 */
                payment_failure_threshold: number;
            }>;
            /** The tax details. */
            taxes: Taxes;
            /** Indicates whether you can subscribe to this plan by providing a quantity for the goods or service. */
            quantity_supported: boolean;
            /** The product details. */
            product: Partial<{
                /** The product name. */
                name: string;
                /** The product description. */
                description: string;
                /** The product type. Indicates whether the product is physical or digital goods, or a service. */
                type: ProductType;
                /** The product category. */
                category: Category;
                /** The image URL for the product. */
                image_url: string;
                /** The image URL for the product. */
                home_url: string;
            }>;
        }>;
        /** An array of request-related [HATEOAS links](/docs/api/reference/api-responses/#hateoas-links). */
        links: Array<{
            href: string;
            rel: string;
            /** The HTTP method required to make the related call. */
            method?:
                | "GET"
                | "POST"
                | "PUT"
                | "DELETE"
                | "HEAD"
                | "CONNECT"
                | "OPTIONS"
                | "PATCH";
            /** The link title. */
            title?: string;
            /** The media type in which to submit the request data. */
            encType?: string;
            /** The request data or link target. */
            schema?: unknown;
            /** The request data or link target. */
            targetSchema?: unknown;
        }>;
    }>;
};
