import "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": ButtonProps;
        }
    }
}

export const BUTTON_TYPES = {
    BUYNOW: "buynow",
    CHECKOUT: "checkout",
    DONATE: "donate",
    PAY: "pay",
    SUBSCRIBE: "subscribe",
} as const;

export type ButtonTypes = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    type?: ButtonTypes;
    disabled?: boolean;
}
