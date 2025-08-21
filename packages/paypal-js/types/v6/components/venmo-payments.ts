import { PayPalOneTimePaymentPaymentSessionInputs } from "./paypal-payments";

export type VenmoPaymentSessionInputs = Omit<
    PayPalOneTimePaymentPaymentSessionInputs,
    "onShippingAddressChange" | "onShippingOptionsChange"
>;
