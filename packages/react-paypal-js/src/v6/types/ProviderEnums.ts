export enum INSTANCE_LOADING_STATE {
  PENDING = "pending",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

export enum INSTANCE_DISPATCH_ACTION {
  SET_LOADING_STATUS = "setLoadingStatus",
  SET_INSTANCE = "setInstance",
  SET_ELIGIBILITY = "setEligibility",
  SET_ELIGIBILITY_HYDRATION_STATUS = "setEligibilityHydrationStatus",
  SET_ELIGIBILITY_HYDRATED = "setEligibilityHydrated",
  SET_ERROR = "setError",
  RESET_STATE = "resetState",
}

export enum BRAINTREE_DISPATCH_ACTION {
  SET_LOADING_STATUS = "setLoadingStatus",
  SET_INSTANCE = "setInstance",
  SET_ELIGIBILITY = "setEligibility",
  SET_ERROR = "setError",
  RESET_STATE = "resetState",
}
