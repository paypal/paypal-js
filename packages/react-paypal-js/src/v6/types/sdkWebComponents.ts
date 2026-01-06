import type { HTMLAttributes } from "react";

export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

export interface IntrinsicButtonProps
    extends HTMLAttributes<HTMLButtonElement>,
        ButtonProps {}

/**
 * Internal interface for the PayLater web component.
 * Includes countryCode and productCode which are populated internally by the React component.
 */
export interface IntrinsicPayLaterButtonProps
    extends HTMLAttributes<HTMLButtonElement> {
    countryCode?: string;
    productCode?: string;
    disabled?: boolean;
}
