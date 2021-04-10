import type { PayPalScriptOptions } from "./script-options";
import type {
    PayPalButtonsComponentProps,
    PayPalButtonsComponent,
} from "./components/buttons";
import type {
    PayPalMarksComponentProps,
    PayPalMarksComponent,
} from "./components/marks";
import type {
    PayPalMessagesComponentProps,
    PayPalMessagesComponent,
} from "./components/messages";
import type {
    getFundingSources,
    isFundingEligible,
    rememberFunding,
} from "./components/funding-eligibility";
import type { PayPalHostedFieldsComponent } from "./components/hosted-fields";

export interface PayPalNamespace {
    Buttons?: (options?: PayPalButtonsComponentProps) => PayPalButtonsComponent;
    Marks?: (options?: PayPalMarksComponentProps) => PayPalMarksComponent;
    Messages?: (
        options?: PayPalMessagesComponentProps
    ) => PayPalMessagesComponent;
    HostedFields?: PayPalHostedFieldsComponent;
    getFundingSources?: getFundingSources;
    isFundingEligible?: isFundingEligible;
    rememberFunding?: rememberFunding;
    FUNDING?: Record<string, string>;
    version: string;
}

declare module "@paypal/paypal-js" {
    export function loadScript(
        options: PayPalScriptOptions,
        PromisePonyfill?: PromiseConstructor
    ): Promise<PayPalNamespace | null>;

    export function loadCustomScript(options: {
        url: string;
        attributes?: Record<string, string>;
        PromisePonyfill?: PromiseConstructor;
    }): Promise<void>;

    export const version: string;
}

declare global {
    interface Window {
        paypal?: PayPalNamespace;
    }
}
