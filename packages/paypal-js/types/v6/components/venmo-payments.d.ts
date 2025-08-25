import { PayPalOneTimePaymentSessionOptions } from "./paypal-payments";

export type VenmoPaymentSessionOptions = Omit<
    PayPalOneTimePaymentSessionOptions,
    "onShippingAddressChange" | "onShippingOptionsChange"
>;
