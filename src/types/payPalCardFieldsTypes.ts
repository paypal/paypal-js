import {
    PayPalCardFieldsInputEvents,
    PayPalCardFieldsIndividualFieldOptions as FieldOptions,
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldCardFieldData,
    PayPalCardFieldSecurityCode,
    PayPalCardFieldsCardObject,
    PayPalCardFieldsStateObject,
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
} from "@paypal/paypal-js/types/components/card-fields";

export type {
    PayPalCardFieldsInputEvents,
    PayPalCardFieldsComponentOptions,
    PayPalCardFieldCardFieldData,
    PayPalCardFieldSecurityCode,
    PayPalCardFieldsCardObject,
    PayPalCardFieldsStateObject,
    PayPalCardFieldsComponent,
    PayPalCardFieldsIndividualField,
};

export type PayPalCardFieldsIndividualFieldOptions = FieldOptions & {
    className?: string;
};

export type PayPalCardFieldsNamespace = {
    components: string | string[] | undefined;
} & { [DATA_NAMESPACE: string]: string | undefined };

export type CardFieldStyle = {
    appearance?: string;
    color?: string;
    direction?: string;
    font?: string;
    fontFamily?: string;
    fontSizeAdjust?: string;
    fontSize?: string;
    fontStretch?: string;
    fontStyle?: string;
    fontVariantAlternates?: string;
    fontVariantCaps?: string;
    fontVariantEastAsian?: string;
    fontVariantLigatures?: string;
    fontVariantNumeric?: string;
    fontVariant?: string;
    fontWeight?: string;
    letterSpacing?: string;
    lineHeight?: string;
    opacity?: string;
    outline?: string;
    padding?: string;
    paddingTop?: string;
    paddingRight?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    textShadow?: string;
    transition?: string;
    MozApperance?: string;
    MozOsxFontSmoothing?: string;
    MozTapHighlightColor?: string;
    MozTransition?: string;
    WebkitAppearance?: string;
    WebkitOsxFontSmoothing?: string;
    WebkitTapHighlightColor?: string;
    WebkitTransition?: string;
};
