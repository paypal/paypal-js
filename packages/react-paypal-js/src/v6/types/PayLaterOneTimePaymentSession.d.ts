import type { CreateOrderCallback } from "@paypal/paypal-js/sdk-v6";
import type {
    PayLaterOneTimePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "./";

export type PayLaterOneTimePaymentSessionProps =
    | (Omit<PayLaterOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: CreateOrderCallback;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          orderId?: never;
      })
    | (PayLaterOneTimePaymentSessionOptions & {
          createOrder?: never;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          orderId: string;
      });

export interface PayLaterOneTimePaymentSessionReturn {
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
