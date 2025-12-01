import "react";

export interface IntrinsicButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    type?: ButtonTypes;
    disabled?: boolean;
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": IntrinsicButtonProps;
        }
    }
}
