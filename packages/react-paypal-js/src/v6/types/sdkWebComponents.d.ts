import "react";
export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

interface IntrinsicButtonProps
    extends React.HTMLAttributes<HTMLButtonElement>,
        ButtonProps {}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
            "venmo-button": IntrinsicButtonProps;
        }
    }
}
