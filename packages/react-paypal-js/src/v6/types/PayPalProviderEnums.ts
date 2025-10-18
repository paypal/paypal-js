export enum INSTANCE_LOADING_STATE {
    INITIAL = "initial",
    PENDING = "pending",
    RESOLVED = "resolved",
    REJECTED = "rejected",
}

export enum INSTANCE_DISPATCH_ACTION {
    SET_LOADING_STATUS = "setLoadingStatus",
    SET_INSTANCE = "setInstance",
    SET_ELIGIBILITY = "setEligibility",
    SET_ERROR = "setError",
    RESET_STATE = "resetState",
}
