import type { PayPalScriptOptions } from './script-options';
import type { PayPalButtonsComponentProps, PayPalButtonsComponent } from './components/buttons';

export interface PayPalNamespace {
    Buttons?: (options?: PayPalButtonsComponentProps) => PayPalButtonsComponent;
    version: string;
}

declare module '@paypal/paypal-js' {
    export function loadScript(
        options: PayPalScriptOptions,
        PromisePonyfill? : PromiseConstructor
    ): Promise<PayPalNamespace | null>;

    export const version: string;
}

declare global {
    interface Window {
        paypal?: PayPalNamespace;
    }
}
