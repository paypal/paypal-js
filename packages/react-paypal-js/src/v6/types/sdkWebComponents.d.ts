import "react";
export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

export interface PayLaterButtonProps {
    /**
     * Required for the button to render. Automatically populated from the eligibility API response
     * (`eligible_methods.paypal_pay_later.country_code`) when using `PayLaterOneTimePaymentButton`.
     * Can be provided manually as an override if needed.
     */
    countryCode?: string;
    /**
     * Required for the button to render. Automatically populated from the eligibility API response
     * (`eligible_methods.paypal_pay_later.product_code`) when using `PayLaterOneTimePaymentButton`.
     * Can be provided manually as an override if needed.
     */
    productCode?: string;
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
