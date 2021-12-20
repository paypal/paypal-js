export interface AmountWithCurrencyCode {
    /** The [three-character ISO-4217 currency code](/docs/integration/direct/rest/currency-codes/) that identifies the currency. */
    currency_code: string;
    /**
     * The value, which might be:
     * - An integer for currencies like `JPY` that are not typically fractional.
     * - A decimal fraction for currencies like `TND` that are subdivided into thousandths.
     *
     * For the required number of decimal places for a currency code, see [Currency Codes](/docs/integration/direct/rest/currency-codes/).
     */
    value: string;
}

export interface Address {
    /**
     * The first line of the address. For example, number or street.
     * @maxLength 300
     */
    address_line_1?: string;
    /**
     * The second line of the address. For example, suite or apartment number.
     * @maxLength 300
     */
    address_line_2?: string;
    /** The highest level sub-division in a country, which is usually a province, state, or ISO-3166-2 subdivision. */
    admin_area_1?: string;
    /** A city, town, or village. Smaller than `admin_area_level_1`. */
    admin_area_2?: string;
    /**
     * The postal code, which is the zip code or equivalent.
     * Typically required for countries with a postal code or an equivalent.
     */
    postal_code?: string;
    /** The [two-character ISO 3166-1 code](/docs/integration/direct/rest/country-codes/) that identifies the country or region. */
    country_code: string;
}

export interface Taxes {
    /** The percentage, as a fixed-point, signed decimal number. For example, define a 19.99% interest rate as `19.99`. */
    percentage: string;
    /** Indicates whether the tax was already included in the billing amount. */
    inclusive?: string;
    /** The currency and amount for a financial transaction, such as a balance or payment due. */
    amount?: AmountWithCurrencyCode;
}

export interface Card {
    /** The PayPal-generated ID for the card. */
    id: string;
    /** The card holder's name as it appears on the card. */
    name: string;
    /** The last digits of the payment card. */
    last_n_chars: string;
    /** The last digits of the payment card. */
    last_digits: string;
    /** The card network or brand. Applies to credit, debit, gift, and payment cards. */
    brand: string;
    /** The payment card type. */
    type: string;
    /** The issuer of the card instrument. */
    issuer: string;
    /**
     * An acronym for Bank Identification Number (BIN), also known as IIN (Issuer Identification Number).
     * It Is a standardized global numbering scheme (6 to 8 digits) used to identify a bank / institution that issued the card.
     */
    bin: string;
    /** The year and month, in ISO-8601 `YYYY-MM` date format. */
    expiry: string;
    /** The [three-character ISO-4217 currency code](/docs/integration/direct/rest/currency-codes/) that identifies the currency. */
    currency_code?: string;
    /** Results of Authentication such as 3D Secure. */
    authentication_result: Partial<{
        /** Liability shift indicator. The outcome of the issuer's authentication. */
        liability_shift: "YES" | "NO" | "POSSIBLE" | "UNKNOWN";
        /** Results of 3D Secure Authentication. */
        three_d_secure: Partial<{
            /**
             * Transactions status result identifier.
             * The outcome of the issuer's authentication.
             * @type Y Successful authentication.
             * @type N Failed authentication / account not verified / transaction denied.
             * @type U Unable to complete authentication.
             * @type A Successful attempts transaction.
             * @type C Challenge required for authentication.
             * @type R Authentication rejected (merchant must not submit for authorization).
             * @type D Challenge required; decoupled authentication confirmed.
             * @type I Informational only; 3DS requestor challenge preference acknowledged.
             */
            authentication_status:
                | "Y"
                | "N"
                | "U"
                | "A"
                | "C"
                | "R"
                | "D"
                | "I";
            /**
             * Status of Authentication eligibility.
             * @type Y Yes. The bank is participating in 3-D Secure protocol and will return the ACSUrl.
             * @type N No. The bank is not participating in 3-D Secure protocol.
             * @type U Unavailable. The DS or ACS is not available for authentication at the time of the request.
             *  @type B Bypass. The merchant authentication rule is triggered to bypass authentication.
             */
            enrollment_status: "Y" | "N" | "U" | "B";
        }>;
    }>;
    /** Additional attributes associated with the use of this card. */
    attributes?: {
        /** The details about a saved payment source. */
        vault?: Partial<{
            /** The PayPal-generated ID for the saved payment source. */
            id: string;
            /** The vault status. */
            status: "CREATED" | "APPROVED";
        }>;
    };
    /** The portable international postal address.  */
    billing_address?: Address;
}
