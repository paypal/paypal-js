import "react";

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "paypal-button": ButtonProps;
        }
    }
}

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    // TODO add type for button types?
    type: string;
    disabled?: boolean;
}
