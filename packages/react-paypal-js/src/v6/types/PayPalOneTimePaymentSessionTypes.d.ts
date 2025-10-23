import type {
    PayPalOneTimePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "@paypal/paypal-js/sdk-v6";

export type UsePayPalOneTimePaymentSessionProps =
    | (Omit<PayPalOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => Promise<{ orderId: string }>;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          orderId?: never;
      })
    | (PayPalOneTimePaymentSessionOptions & {
          createOrder?: never;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          orderId: string;
      });

export interface UsePayPalOneTimePaymentSessionReturn {
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
