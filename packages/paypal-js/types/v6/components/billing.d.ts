import {
    OnCompleteData,
    OnCancelData,
    OnErrorData,
    OnApproveDataOneTimePayments,
} from "./payments";

export type BillingSessionInputs = {
    onApprove?: (data: OnApproveDataOneTimePayments) => Promise<void>;
    onCancel?: (data?: OnCancelData) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: OnErrorData) => void;
    billingToken?: string;
};
