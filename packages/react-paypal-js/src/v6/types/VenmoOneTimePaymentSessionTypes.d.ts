import type {
    VenmoOneTimePaymentSessionOptions,
    VenmoPresentationModeOptions,
    VenmoOneTimePaymentSessionPromise,
} from "@paypal/paypal-js/sdk-v6";

// TODO: Add all startOptions to this hook
export type UseVenmoOneTimePaymentSessionProps =
    | (Omit<VenmoOneTimePaymentSessionOptions, "orderId"> & {
          createOrder: () => VenmoOneTimePaymentSessionPromise;
          presentationMode: VenmoPresentationModeOptions["presentationMode"];
          orderId?: never;
      })
    | (VenmoOneTimePaymentSessionOptions & {
          createOrder?: never;
          presentationMode: VenmoPresentationModeOptions["presentationMode"];
          orderId: string;
      });

export interface UseVenmoOneTimePaymentSessionReturn {
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
