import type { PayPalScriptOptions } from './script-options';
import type { PayPalButtonsComponentProps, PayPalButtonsComponent } from './components/buttons';
import type { PayPalMarksComponentProps, PayPalMarksComponent } from './components/marks';
import type { PayPalMessagesComponentProps, PayPalMessagesComponent } from './components/messages';

export interface PayPalNamespace {
    Buttons?: (options?: PayPalButtonsComponentProps) => PayPalButtonsComponent;
    Marks?: (options?: PayPalMarksComponentProps) => PayPalMarksComponent;
    Messages?: (options?: PayPalMessagesComponentProps) => PayPalMessagesComponent;
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
