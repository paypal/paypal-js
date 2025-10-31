import type {
    SavePaymentSessionOptions,
    PayPalPresentationModeOptions,
} from "./";

export type PayPalSavePaymentSessionProps =
    | (Omit<SavePaymentSessionOptions, "orderId"> & {
          createVaultToken: () => Promise<{ vaultSetupToken: string }>;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          vaultSetupToken?: never;
      })
    | (SavePaymentSessionOptions & {
          createVaultToken?: never;
          presentationMode: PayPalPresentationModeOptions["presentationMode"];
          vaultSetupToken: string;
      });

export interface PayPalSavePaymentSessionReturn {
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}
