export interface PayPalCardFieldsStyleOptions {
    appearance?: string;
    color?: string;
    direction?: string;
    font?: string;
    "font-family"?: string;
    "font-size"?: string;
    "font-size-adjust"?: string;
    "font-stretch"?: string;
    "font-style"?: string;
    "font-variant"?: string;
    "font-variant-alternates"?: string;
    "font-variant-caps"?: string;
    "font-variant-east-asian"?: string;
    "font-variant-ligatures"?: string;
    "font-variant-numeric"?: string;
    "font-weight"?: string;
    "letter-spacing"?: string;
    "line-height"?: string;
    opacity?: string;
    outline?: string;
    padding?: string;
    "padding-bottom"?: string;
    "padding-left"?: string;
    "padding-right"?: string;
    "padding-top"?: string;
    "text-shadow"?: string;
    transition?: string;
    "-moz-appearance"?: string;
    "-moz-osx-font-smoothing"?: string;
    "-moz-tap-highlight-color"?: string;
    "-moz-transition"?: string;
    "-webkit-appearance"?: string;
    "-webkit-osx-font-smoothing"?: string;
    "-webkit-tap-highlight-color"?: string;
    "-webkit-transition"?: string;
}

export interface PayPalCardFieldsInputEvents {
    onChange?: (data: PayPalCardFieldsStateObject) => void;
    onFocus?: (data: PayPalCardFieldsStateObject) => void;
    onBlur?: (data: PayPalCardFieldsStateObject) => void;
    onInputSubmitRequest?: (data: PayPalCardFieldsStateObject) => void;
}

export interface PayPalCardFieldSecurityCode {
    code: string;
    size: number;
}

export interface PayPalCardFieldsCardObject {
    code: PayPalCardFieldSecurityCode;
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
}

export type PayPalCardFieldError =
    | "INELIGIBLE_CARD_VENDOR"
    | "INVALID_NAME"
    | "INVALID_NUMBER"
    | "INVALID_EXPIRY"
    | "INVALID_CVV";

export interface PayPalCardFieldCardFieldData {
    isFocused: boolean;
    isEmpty: boolean;
    isValid: boolean;
    isPotentiallyValid: boolean;
}

export interface PayPalCardFieldsStateObject {
    cards: PayPalCardFieldsCardObject[];
    emittedBy?: "name" | "number" | "cvv" | "expiry";
    isFormValid: boolean;
    errors: PayPalCardFieldError[];
    fields: {
        cardCvvField: PayPalCardFieldCardFieldData;
        cardNumberField: PayPalCardFieldCardFieldData;
        cardNameField: PayPalCardFieldCardFieldData;
        cardExpiryField: PayPalCardFieldCardFieldData;
    };
}

export interface PayPalCardFieldsIndividualFieldOptions {
    placeholder: string;
    inputEvents?: PayPalCardFieldsInputEvents;
    style?: Record<string, PayPalCardFieldsStyleOptions>;
}

export interface PayPalCardFieldsIndividualField {
    render: (container: string) => void;
    addClass: (className: string) => Promise<void>;
    clear: () => void;
    focus: () => void;
    removeAttribute: (
        name: "aria-invalid" | "aria-required" | "disabled" | "placeholder",
    ) => Promise<void>;
    removeClass: (className: string) => Promise<void>;
    setAttribute: (name: string, value: string) => Promise<void>;
    setMessage: (message: string) => void;
}

export interface PayPalCardFieldsComponentOptions {
    createOrder: () => Promise<string>;
    onApprove: (err: Record<string, unknown>) => void;
    onError: (err: Record<string, unknown>) => void;
    inputEvents?: PayPalCardFieldsInputEvents;
    style?: Record<string, PayPalCardFieldsStyleOptions>;
}

export interface PayPalCardFieldsComponent {
    getState: () => Promise<PayPalCardFieldsStateObject>;
    isEligible: () => boolean;
    submit: () => Promise<void>;
    NameField: (
        options: PayPalCardFieldsIndividualFieldOptions,
    ) => PayPalCardFieldsIndividualField;
    NumberField: (
        options: PayPalCardFieldsIndividualFieldOptions,
    ) => PayPalCardFieldsIndividualField;
    CVVField: (
        options: PayPalCardFieldsIndividualFieldOptions,
    ) => PayPalCardFieldsIndividualField;
    ExpiryField: (
        options: PayPalCardFieldsIndividualFieldOptions,
    ) => PayPalCardFieldsIndividualField;
}
