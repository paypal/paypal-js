import { PayPalPresentationModeOptions } from ".";

export * from "./PayPalProviderEnums";

export type * from "@paypal/paypal-js/sdk-v6";

export interface BasePaymentSessionReturn {
    error: Error | null;
    handleClick: () => Promise<void>;
    handleCancel: () => void;
    handleDestroy: () => void;
}

/**
 * Helper for sessions that use createOrder/orderId pattern.
 * Automatically distributes over PayPalPresentationModeOptions union.
 */
export type OrderSessionProps<BaseOptions> =
    PayPalPresentationModeOptions extends infer Mode
        ? Mode extends PayPalPresentationModeOptions
            ?
                  | (Omit<BaseOptions, "orderId"> & {
                        createOrder: () => Promise<{ orderId: string }>;
                        orderId?: never;
                    } & Mode)
                  | (BaseOptions & {
                        createOrder?: never;
                        orderId: string;
                    } & Mode)
            : never
        : never;

/**
 * Helper for sessions that use createVaultToken/vaultSetupToken pattern.
 * Automatically distributes over PayPalPresentationModeOptions union.
 */
export type VaultSessionProps<BaseOptions> =
    PayPalPresentationModeOptions extends infer Mode
        ? Mode extends PayPalPresentationModeOptions
            ?
                  | (Omit<BaseOptions, "orderId"> & {
                        createVaultToken: () => Promise<{
                            vaultSetupToken: string;
                        }>;
                        vaultSetupToken?: never;
                    } & Mode)
                  | (BaseOptions & {
                        createVaultToken?: never;
                        vaultSetupToken: string;
                    } & Mode)
            : never
        : never;
