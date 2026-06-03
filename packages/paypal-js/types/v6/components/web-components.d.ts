import { OnErrorData } from "./base-component";

export interface PayPalButtonElement extends HTMLElement {
  type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
  disabled?: boolean;
  onError?: (data: OnErrorData) => void;
}

export interface PayPalPayLaterButtonElement extends HTMLElement {
  countryCode?: string;
  productCode?: string;
  disabled?: boolean;
}

export interface PayPalCreditButtonElement extends HTMLElement {
  countryCode?: string;
  disabled?: boolean;
}

export interface PayPalBasicCardButtonElement extends HTMLElement {
  buyerCountry?: string;
  disabled?: boolean;
}

export interface PayPalMessageElement extends HTMLElement {
  amount?: string;
  "auto-bootstrap"?: boolean;
  "buyer-country"?: string;
  "currency-code"?: string;
  "logo-position"?: "INLINE" | "LEFT" | "RIGHT" | "TOP";
  "logo-type"?: "MONOGRAM" | "WORDMARK";
  "offer-types"?: string;
  "presentation-mode"?: "AUTO" | "MODAL" | "POPUP" | "REDIRECT";
  "text-color"?: "BLACK" | "MONOCHROME" | "WHITE";
  setContent?: (content: Record<string, unknown>) => void;
}

export interface ApplePayButtonElement extends HTMLElement {
  buttonstyle?: string;
  type?: string;
  locale?: string;
  disabled?: boolean;
}

declare global {
  interface HTMLElementTagNameMap {
    "paypal-button": PayPalButtonElement;
    "venmo-button": PayPalButtonElement;
    "paypal-pay-later-button": PayPalPayLaterButtonElement;
    "paypal-credit-button": PayPalCreditButtonElement;
    "paypal-basic-card-button": PayPalBasicCardButtonElement;
    "paypal-basic-card-container": HTMLElement;
    "paypal-message": PayPalMessageElement;
    "apple-pay-button": ApplePayButtonElement;
  }
}
