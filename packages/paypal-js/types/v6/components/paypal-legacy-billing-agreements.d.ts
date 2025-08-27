import {
    OnCompleteData,
    OnCancelData,
    OnErrorData,
    OnApproveDataOneTimePayments,
} from "./paypal-payments";

export type BillingOnApproveData = OnApproveDataOneTimePayments;

export type BillingSessionOptions = {
    onApprove?: (data: BillingOnApproveData) => Promise<void>;
    onCancel?: (data?: OnCancelData) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: OnErrorData) => void;
    billingToken?: string;
};
