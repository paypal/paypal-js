// ============================================================================
// Content & Messaging Types
// ============================================================================

type ContentType = "TEXT" | "IMAGE" | "LINK" | "TEXT_VARIABLE";

type ContentBlock = {
    alternativeText?: string;
    altTextPath?: string;
    clickUrl?: string;
    text?: string;
    textPath?: string;
    srcUrl?: string;
    type: ContentType;
    name?: string;
    embeddable?: boolean;
};

type MessageItems = {
    actionItems: ContentBlock[];
    disclaimerItems?: ContentBlock[];
    mainItems: ContentBlock[];
};

// ============================================================================
// Offer Types
// ============================================================================

type OfferType =
    | "PAYPAL_BALANCE"
    | "PAYPAL_CASHBACK_MASTERCARD"
    | "PAYPAL_CREDIT_NO_INTEREST"
    | "PAYPAL_DEBIT_CARD"
    | "PAY_LATER_LONG_TERM"
    | "PAY_LATER_PAY_IN_1"
    | "PAY_LATER_SHORT_TERM";

type OfferTypes = OfferType[];

export type UserOfferTypes = OfferTypes | string;

// ============================================================================
// Base Configuration Types
// ============================================================================

/**
 * Base options for PayPal Messages configuration.
 */
export type PayPalMessagesOptions = {
    buyerCountry?: string;
    currencyCode?: string;
    shopperSessionId?: string;
};

// ============================================================================
// Caching Types
// ============================================================================

type Cache = {
    local: boolean;
    origin: boolean;
};

type UserCache = boolean | Partial<Cache>;

// ============================================================================
// Fetch Content Types
// ============================================================================

type RequestType = "MOCK" | "SAMPLE";

type LogoPosition = "INLINE" | "LEFT" | "RIGHT" | "TOP";

type LogoType = "MONOGRAM" | "NONE" | "TEXT" | "WORDMARK";

type TextColor = "BLACK" | "MONOCHROME" | "WHITE";

type OnReady = (messageContent: MessageContent) => void;

/**
 * Internal options for fetching message content.
 */
type FetchContentOptions = PayPalMessagesOptions & {
    amount?: string;
    cache: Cache;
    logoPosition: LogoPosition;
    logoType: LogoType;
    offerTypes?: OfferTypes;
    onContentReady?: OnReady;
    onTemplateReady?: OnReady;
    requestType?: RequestType; // Used in lower environments to receive request from mock (client-tier) or samples (mid-tier)
    textColor?: TextColor;
};

/**
 * User-facing options for fetching message content.
 */
type UserFetchContentOptions = Omit<
    Partial<FetchContentOptions>,
    "offerTypes" | "cache"
> & {
    cache?: UserCache;
    offerTypes?: UserOfferTypes;
    onReady?: OnReady;
};

/**
 * Message content returned from fetch operations.
 */
export type MessageContent = {
    messageItems: MessageItems;
    config: FetchContentOptions;
    messageOfferType?: OfferType;
    update: (
        fetchContentOptions: UserFetchContentOptions,
    ) => Promise<MessageContent | null>;
    impressionUrl?: string;
    clickUrl?: string;
    embeddable?: boolean;
    partnerAttributionId?: string;
    buyerCountryCode?: string;
    // values needed for analytics captured at time of fetch
    renderDuration?: number;
    pageType?: string;
    attributes?: string[];
    // Flag to indicate if content is template content or final content
    isTemplateContent: boolean;
};

// ============================================================================
// Learn More Types
// ============================================================================

/**
 * Options for configuring Learn More presentations.
 */
type LearnMoreOptions = PayPalMessagesOptions & {
    amount?: string;
    offerType?: OfferType;
    presentationMode: "AUTO" | "MODAL" | "POPUP" | "REDIRECT";
    stageTag?: string;
    clickUrl?: URL;
    embeddable?: boolean;
    onShow?: (data?: object) => void;
    onClose?: (data?: object) => void;
    onApply?: (data?: object) => void;
    onCalculate?: (data?: object) => void;
};

/**
 * User-facing options for Learn More presentations.
 */
export type UserLearnMoreOptions = Omit<
    Partial<LearnMoreOptions>,
    "clickUrl"
> & {
    clickUrl?: string | URL;
};

/**
 * Base type for all LearnMore implementations.
 * Represents the common public API shared by all LearnMore variants.
 */
export type LearnMoreBase = {
    /**
     * Indicates whether the Learn More presentation is currently open.
     */
    isOpen: boolean;

    /**
     * Opens the Learn More presentation.
     * @param userLearnMoreOptions - Optional configuration to update before opening.
     * @returns Promise that resolves when the presentation is opened and configured.
     */
    open: (userLearnMoreOptions?: UserLearnMoreOptions) => Promise<void>;

    /**
     * Closes the Learn More presentation.
     * @param trigger - Optional trigger identifier (e.g., "viaCustomButton").
     */
    close: (trigger?: string) => void;

    /**
     * Updates the Learn More presentation with new options.
     * @param userLearnMoreOptions - New configuration options.
     * @returns Promise that resolves when the update is complete.
     */
    update: (userLearnMoreOptions?: UserLearnMoreOptions) => Promise<void>;

    /**
     * Shows the Learn More presentation (internal display method).
     */
    show: () => void;

    /**
     * Sets up the PostMessenger for communication with the Learn More content.
     */
    setupPostMessenger: () => void;
};

/**
 * Type representing a LearnMorePopup instance.
 * Opens Learn More content in a browser popup window.
 */
export type LearnMorePopupType = LearnMoreBase;

/**
 * Type representing a LearnMoreModal instance.
 * Opens Learn More content in an iframe modal overlay with custom accessibility features.
 */
export type LearnMoreModalType = LearnMoreBase & {
    /**
     * Sets up a custom close button with tab trap functionality.
     * Modal-specific method for accessibility enhancements.
     */
    setupCustomCloseButton: () => void;
};

/**
 * Type representing a LearnMoreRedirect instance.
 * Opens Learn More content in a new browser tab/window via window.open().
 */
export type LearnMoreRedirectType = LearnMoreBase;

/**
 * Union type for all Learn More presentation variants.
 */
export type LearnMore =
    | LearnMorePopupType
    | LearnMoreModalType
    | LearnMoreRedirectType;

// ============================================================================
// Public API Types
// ============================================================================

/**
 * Session object for managing PayPal Messages.
 */
export type PayPalMessagesSession = {
    fetchContent: () => MessageContent;
    createLearnMore: (options: LearnMoreOptions) => LearnMore;
};

/**
 * Main PayPal Messages instance interface.
 */
export interface PayPalMessagesInstance {
    createPayPalMessages: (
        messagesOptions?: PayPalMessagesOptions,
    ) => PayPalMessagesSession;
}
