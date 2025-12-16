import "react";
export interface ButtonProps {
    type?: "buynow" | "checkout" | "donate" | "pay" | "subscribe";
    disabled?: boolean;
}

export interface PayLaterButtonProps {
    /**
     * Required for the web component to render. When using `PayLaterOneTimePaymentButton`,
     * this is automatically populated from the eligibility API response
     * (`eligible_methods.paypal_pay_later.country_code`).
     */
    countryCode?: string;
    /**
     * Required for the web component to render. When using `PayLaterOneTimePaymentButton`,
     * this is automatically populated from the eligibility API response
     * (`eligible_methods.paypal_pay_later.product_code`).
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
