import "react";
export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

export interface PayLaterButtonProps {
    disabled?: boolean;
}

interface IntrinsicButtonProps
    extends React.HTMLAttributes<HTMLButtonElement>,
        ButtonProps {}

interface IntrinsicPayLaterButtonProps
    extends React.HTMLAttributes<HTMLButtonElement>,
        PayLaterButtonProps {}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
            "venmo-button": IntrinsicButtonProps;
            "paypal-pay-later-button": IntrinsicPayLaterButtonProps;
        }
    }
}
