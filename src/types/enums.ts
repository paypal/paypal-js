export enum SCRIPT_LOADING_STATE {
    INITIAL = "initial",
    PENDING = "pending",
    REJECTED = "rejected",
    RESOLVED = "resolved",
}

export enum SCRIPT_PROVIDER_DISPATCH_ACTION {
    LOADING_STATUS = "setLoadingStatus",
    RESET_OPTIONS = "resetOptions",
    SET_BRAINTREE_INSTANCE = "braintreeInstance",
}
