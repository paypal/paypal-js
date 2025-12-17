import "react";
export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

interface IntrinsicButtonProps
    extends React.HTMLAttributes<HTMLButtonElement>,
        ButtonProps {}

/**
 * Internal interface for the PayLater web component.
 * Includes countryCode and productCode which are populated internally by the React component.
 */
interface IntrinsicPayLaterButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    countryCode?: string;
    productCode?: string;
    disabled?: boolean;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
            "venmo-button": IntrinsicButtonProps;
            "paypal-pay-later-button": IntrinsicPayLaterButtonProps;
        }
    }
}
