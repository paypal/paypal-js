export type StateType = "canceled" | "failed" | "succeeded";

export type ValidCssSelector =
    | ".invalid"
    | ".invalid.focus"
    | "input"
    | "input.disabled"
    | "input.focus"
    | "input.invalid"
    | "input.valid"
    | "input::placeholder"
    | "label"
    | "label.disabled"
    | "label.focus"
    | "label.invalid"
    | "label.valid"
    | "label::placeholder";

export type ValidCssProperties =
    | "appearance"
    | "background"
    | "border"
    | "borderRadius"
    | "boxShadow"
    | "color"
    | "direction"
    | "font"
    | "fontFamily"
    | "fontSize"
    | "fontSizeAdjust"
    | "fontStretch"
    | "fontStyle"
    | "fontVariant"
    | "fontVariantAlternates"
    | "fontVariantCaps"
    | "fontVariantEastAsian"
    | "fontVariantLigatures"
    | "fontVariantNumeric"
    | "fontWeight"
    | "height"
    | "letterSpacing"
    | "lineHeight"
    | "opacity"
    | "outline"
    | "padding"
    | "paddingBottom"
    | "paddingLeft"
    | "paddingRight"
    | "paddingTop"
    | "textShadow"
    | "transition";

export type MerchantStyleObject = Partial<{
    [key in ValidCssSelector]: Partial<{
        [key in ValidCssProperties]: string | number;
    }>;
}>;

export type OneTimePaymentFlowResponse = {
    data: {
        orderId: string;
        message?: string;
        liabilityShift?: string;
    };
    state: StateType;
};

export type SavePaymentFlowResponse = {
    data: {
        vaultSetupToken: string;
        message?: string;
        liabilityShift?: string;
    };
    state: StateType;
};

export type FieldState = {
    isFocused: boolean;
    isValid: boolean;
    isEmpty: boolean;
    isPotentiallyValid: boolean;
};

export type CardFieldTypes = "cvv" | "expiry" | "number";

export type MerchantMessagingEvents =
    | "blur"
    | "cardtypechange"
    | "change"
    | "empty"
    | "focus"
    | "inputsubmit"
    | "notempty"
    | "validitychange";

export type Card = {
    code: {
        name: string;
        size: number;
    };
    niceType: string;
    type: string;
};

export type EventState = {
    cards: Card[];
    emittedBy: CardFieldTypes;
    number: FieldState;
    cvv: FieldState;
    expiry: FieldState;
};

export type CardFieldsEventsOptions = {
    [key in MerchantMessagingEvents]: (state: EventState) => void;
};

export type OrderAmount = {
    value?: string;
    currencyCode?: string;
};

export type UpdateOptions = {
    amount?: OrderAmount;
    isCobrandedEligible?: boolean;
};

export type BillingAddress = {
    addressLine1?: string;
    addressLine2?: string;
    adminArea2?: string;
    adminArea1?: string;
    postalCode?: string;
    countryCode?: string;
};

export type ExtraFields = {
    name?: string;
    billingAddress?: BillingAddress;
};

export type CardFieldOptions = {
    type: CardFieldTypes;
    placeholder?: string;
    label?: string;
    style?: MerchantStyleObject;
    ariaDescription?: string;
    ariaLabel?: string;
    ariaInvalidErrorMessage?: string;
};

type BaseCardFieldsSession = {
    createCardFieldsComponent: (config: CardFieldOptions) => HTMLElement;
    on: (
        eventName: MerchantMessagingEvents,
        callback: CardFieldsEventsOptions[MerchantMessagingEvents],
    ) => Promise<void>;
    update: (options: UpdateOptions) => void;
};

export type OneTimePaymentSubmitOptions = [orderId: string, data: ExtraFields];

export type CardFieldsOneTimePaymentSession = BaseCardFieldsSession & {
    submit: (
        ...args: OneTimePaymentSubmitOptions
    ) => Promise<OneTimePaymentFlowResponse>;
};

export type SavePaymentSubmitOptions = [
    vaultSetupToken: string,
    data: ExtraFields,
];

export type CardFieldsSavePaymentSession = BaseCardFieldsSession & {
    submit: (
        ...args: SavePaymentSubmitOptions
    ) => Promise<SavePaymentFlowResponse>;
};

/**
 * CardFieldsInstance interface for creating and managing different types of Card Fields sessions.
 *
 * @remarks
 * This interface provides methods to create the following Card Fields flows:
 * - One-time payments with Card Fields
 * - Save payment methods for future use (vaulting)
 *
 * Each method returns a session object that can be used to initiate the corresponding Card Fields flow.
 */
export interface CardFieldsInstance {
    /**
     * Creates a Card Fields one-time payment session for processing payments.
     *
     * @returns A session object that can be used to start the payment flow
     *
     * @example
     * ```typescript
     * const cardFieldsInstance = sdkInstance.createCardFieldsOneTimePaymentSession();
     * ```
     */
    createCardFieldsOneTimePaymentSession: () => CardFieldsOneTimePaymentSession;
    /**
     * Creates a Card Fields save payment session for storing payment methods for future use.
     *
     * @returns A session object that can be used to start the vault setup flow
     *
     * @example
     * ```typescript
     * const cardFieldsInstance = sdkInstance.createCardFieldsSavePaymentSession();
     * ```
     */
    createCardFieldsSavePaymentSession: () => CardFieldsSavePaymentSession;
}
