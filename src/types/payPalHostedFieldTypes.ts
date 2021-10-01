import type { PayPalHostedFieldsComponent } from "@paypal/paypal-js/types/components/hosted-fields";
import type { ReactNode } from "react";

import { PAYPAL_HOSTED_FIELDS_TYPES } from "./enums";

export type PayPalHostedFieldsNamespace = {
    components: string | undefined;
    [DATA_NAMESPACE: string]: string | undefined;
};

export type PayPalHostedFieldOptions = {
    // The string element selector (#id, .class). Represent the field identifier
    selector: string;
    // The placeholder of the field cvv->(300), expirationDate->(MM/YY)
    placeholder?: string;
    // The `type` attribute of the input. To mask `cvv` input, for instance, `type: "password"` can be used
    type?: string;
    // Enable or disable automatic formatting on this field
    formatInput?: boolean;
    // Enable or disable input masking when input is not focused. If set to `true` instead of an object, the defaults for the `maskInput` parameters will be used
    maskInput?: boolean | { character: string };
    select?: boolean | { options: (string | number)[] };
    // This option applies only to the CVV and postal code fields. Will be used as the `maxlength` attribute of the input if it is less than the default.
    // The primary use cases for the `maxlength` option are: limiting the length of the CVV input for CVV-only verifications when the card type is known and limiting the length of the postal code input when cards are coming from a known region.
    maxlength?: number;
    // This option applies only to the cvv and postal code fields. Will be used as the `minlength` attribute of the input.
    minlength?: number;
    // A value to prefill the field with. For example, when creating an update card form, you can prefill the expiration date fields with the old expiration date data.
    prefill?: string;
    // Only allow card types that your merchant account is able to process. Unsupported card types will invalidate the card form. e.g.
    // if you only process Visa cards, a customer entering a American Express card would get an invalid card field. This can only be used for the `number` field.
    rejectUnsupportedCards?: boolean;
};

export interface DecoratedPayPalHostedFieldsComponent
    extends PayPalHostedFieldsComponent {
    close(container: HTMLDivElement | null): void;
}

export type PayPalHostedFieldProps = Record<
    string,
    PayPalHostedFieldOptions | string
> & {
    hostedFieldType: PAYPAL_HOSTED_FIELDS_TYPES;
    options: PayPalHostedFieldOptions;
};

export interface PayPalHostedFieldsBillingAddressProps {
    show: boolean;
    firstName?: { show: boolean; label: string; placeholder: string };
    lastName?: { show: boolean; label: string; placeholder: string };
    company?: { show: boolean; label: string; placeholder: string };
    streetAddress?: { show: boolean; label: string; placeholder: string };
    extendedAddress?: { show: boolean; label: string; placeholder: string };
    locality?: { show: boolean; label: string; placeholder: string };
    region?: { show: boolean; label: string; placeholder: string };
    countryName?: { show: boolean; label: string; placeholder: string };
    countryCodeAlpha2?: { show: boolean; label: string; placeholder: string };
    countryCodeAlpha3?: { show: boolean; label: string; placeholder: string };
    countryCodeNumeric?: { show: boolean; label: string; placeholder: string };
    postalCode?: { show: boolean; label: string; placeholder: string };
}

export interface PayPalHostedFieldsBillingAddress {
    firstName?: string;
    lastName?: string;
    company?: string;
    streetAddress?: string;
    extendedAddress?: string;
    locality?: string;
    region?: string;
    // passing just one of the country options is sufficient to
    // associate the card details with a particular country
    // valid country names and codes can be found here:
    // https://developers.braintreepayments.com/reference/general/countries/ruby#list-of-countries
    countryName?: string;
    countryCodeAlpha2?: string;
    countryCodeAlpha3?: string;
    countryCodeNumeric?: string;
    postalCode?: string;
}

export interface PayPalHostedFieldsComponentProps {
    createOrder: () => Promise<string>;
    children: ReactNode;
    styles?: Record<string, unknown>;
}
