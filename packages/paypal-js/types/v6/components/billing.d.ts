import {
    OnApproveData,
    OnCompleteData,
    OnCancelData,
    OnErrorData,
} from "./payments";

export type BillingSessionInputs = {
    onApprove?: ((data: OnApproveData) => Promise<void>) | undefined;
    onCancel?: (data?: OnCancelData) => void;
    onComplete?: (data?: OnCompleteData) => void;
    onError?: (data: OnErrorData) => void;
    billingToken?: string;
    sdkInstanceId?: string;
};
