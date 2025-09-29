import type {
    Components,
    SdkInstance,
    EligiblePaymentMethodsOutput,
    CreateInstanceOptions,
    LoadCoreSdkScriptOptions,
} from "./";

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

export interface InstanceState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    loadingStatus: INSTANCE_LOADING_STATE;
    error: Error | null;
    createInstanceOptions: CreateInstanceOptions<
        readonly [Components, ...Components[]]
    >;
    scriptOptions: LoadCoreSdkScriptOptions;
}

export type InstanceAction =
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS;
          value: INSTANCE_LOADING_STATE;
      }
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_INSTANCE;
          value: SdkInstance<readonly [Components, ...Components[]]>;
      }
    | {
          type: INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY;
          value: EligiblePaymentMethodsOutput;
      }
    | { type: INSTANCE_DISPATCH_ACTION.SET_ERROR; value: Error }
    | {
          type: INSTANCE_DISPATCH_ACTION.RESET_STATE;
          value: {
              createInstanceOptions: CreateInstanceOptions<
                  readonly [Components, ...Components[]]
              >;
              scriptOptions: LoadCoreSdkScriptOptions;
          };
      };

export interface InstanceContextState {
    sdkInstance: SdkInstance<readonly [Components, ...Components[]]> | null;
    eligiblePaymentMethods: EligiblePaymentMethodsOutput | null;
    error: Error | null;
    dispatch: React.Dispatch<InstanceAction>;
    loadingStatus: INSTANCE_LOADING_STATE;
}
