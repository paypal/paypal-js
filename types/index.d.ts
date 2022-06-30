import type { PayPalScriptOptions } from "./script-options";
import type {
    PayPalButtonsComponentOptions,
    PayPalButtonsComponent,
} from "./components/buttons";
import type {
    PayPalMarksComponentOptions,
    PayPalMarksComponent,
} from "./components/marks";
import type {
    PayPalMessagesComponentOptions,
    PayPalMessagesComponent,
} from "./components/messages";
import type {
    FUNDING_SOURCE,
    getFundingSources,
    isFundingEligible,
    rememberFunding,
} from "./components/funding-eligibility";
import type { PayPalHostedFieldsComponent } from "./components/hosted-fields";

export interface PayPalNamespace {
    Buttons?: (
        options?: PayPalButtonsComponentOptions
    ) => PayPalButtonsComponent;
    Marks?: (options?: PayPalMarksComponentOptions) => PayPalMarksComponent;
    Messages?: (
        options?: PayPalMessagesComponentOptions
    ) => PayPalMessagesComponent;
    HostedFields?: PayPalHostedFieldsComponent;
    getFundingSources?: getFundingSources;
    isFundingEligible?: isFundingEligible;
    rememberFunding?: rememberFunding;
    FUNDING?: Record<string, FUNDING_SOURCE>;
    version: string;
}

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

declare global {
    interface Window {
        paypal?: PayPalNamespace | null;
    }
}

// Export components
export * from "./components/buttons";
export * from "./components/funding-eligibility";
export * from "./components/hosted-fields";
export * from "./components/marks";
export * from "./components/messages";

// Export apis
export * from "./apis/commons";
export * from "./apis/orders";
export * from "./apis/shipping";

// Export apis/subscriptions
export * from "./apis/subscriptions/commons";
export * from "./apis/subscriptions/subscriptions";

// Export script-options
export * from "./script-options";
