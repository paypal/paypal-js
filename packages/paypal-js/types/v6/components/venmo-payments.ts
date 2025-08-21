import { PayPalOneTimePaymentPaymentSessionOptions } from "./paypal-payments";

export type VenmoPaymentSessionOptions = Omit<
    PayPalOneTimePaymentPaymentSessionOptions,
    "onShippingAddressChange" | "onShippingOptionsChange"
>;
