import { CARD_ERRORS } from "../constants";

export type PayPalCardFieldsNamespace = {
    components: string | string[] | undefined;
} & { [DATA_NAMESPACE: string]: string | undefined };

export type PayPalCardFieldsComponent = {
    createOrder: () => Promise<string>;
    createVaultSetupToken: () => Promise<string>;
    onApprove: () => Promise<void>;
    style: CardFieldStyle;
    inputEvents: PayPalCardFieldsInputEvents;
};

export type PayPalCardFieldsInputEvents = {
    onChange: (data: InputEventState) => void;
    onFocus: (data: InputEventState) => void;
    onBlur: (data: InputEventState) => void;
    onInputSubmitRequest: (data: InputEventState) => void;
};

export type PayPalCardFieldsIndividualFieldOptions = {
    placeholder?: string;
    inputEvents?: PayPalCardFieldsInputEvents;
    style?: CardFieldStyle;
    className?: string;
};

export type CardFieldState = {
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
    isFocused: boolean;
};

export type FieldsState = {
    cardNameField?: CardFieldState;
    cardNumberField: CardFieldState;
    cardExpiryField: CardFieldState;
    cardCvvField: CardFieldState;
    cardPostalCodeField?: CardFieldState;
};

export type CardTypeCode = {
    name: string;
    size: number;
};

export type ParsedCardType = {
    niceType:
        | "American Express"
        | "Diners Club"
        | "discover"
        | "JCB"
        | "Maestro"
        | "Mastercard"
        | "UnionPay"
        | "Visa"
        | "Elo"
        | "Hiper"
        | "Hipercard";
    type:
        | "american-express"
        | "diners-club"
        | "discover"
        | "jcb"
        | "maestro"
        | "mastercard"
        | "unionpay"
        | "visa"
        | "elo"
        | "hiper"
        | "hipercard";
    code: CardTypeCode;
};

export type InputEventState = {
    cards: Array<ParsedCardType>;
    emittedBy: "name" | "number" | "cvv" | "expiry";
    fields: FieldsState;
    errors: typeof CARD_ERRORS[keyof typeof CARD_ERRORS];
    isFormValid: boolean;
};

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

type CardFieldName = `${"name" | "number" | "cvv" | "expiry"}Field`;

export type PayPalCardFieldsStateObject = {
    cards: ParsedCardType[];
    emittedBy?: string;
    isFormValid: boolean;
    fields: Record<CardFieldName, CardFieldState>;
};

export type PayPalCardFieldsRef = {
    getState: () => Promise<PayPalCardFieldsStateObject>;
    isEligible: () => boolean;
    submit: () => Promise<void>;
    NameField: (
        options?: PayPalCardFieldsIndividualFieldOptions
    ) => PayPalCardFieldsIndividualField;
    NumberField: (
        options?: PayPalCardFieldsIndividualFieldOptions
    ) => PayPalCardFieldsIndividualField;
    CVVField: (
        options?: PayPalCardFieldsIndividualFieldOptions
    ) => PayPalCardFieldsIndividualField;
    ExpiryField: (
        options?: PayPalCardFieldsIndividualFieldOptions
    ) => PayPalCardFieldsIndividualField;
};

export interface PayPalCardFieldsIndividualField {
    render: (container: HTMLElement) => Promise<void>;
    addClass: (className: string) => Promise<void>;
    close: (...args: unknown[]) => Promise<void>;
    clear: () => void;
    focus: () => void;
    removeAttribute: (
        name: "aria-invalid" | "aria-required" | "disabled" | "placeholder"
    ) => Promise<void>;
    removeClass: (className: string) => Promise<void>;
    setAttribute: (name: string, value: string) => Promise<void>;
    setMessage: (message: string) => void;
}
