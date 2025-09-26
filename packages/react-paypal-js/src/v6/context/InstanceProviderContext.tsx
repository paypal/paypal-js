import { createContext } from "react";

import {
    InstanceContextState,
    InstanceState,
    InstanceAction,
    INSTANCE_LOADING_STATE,
    INSTANCE_DISPATCH_ACTION,
} from "../types/InstanceProviderTypes";

export function instanceReducer(
    state: InstanceState,
    action: InstanceAction,
): InstanceState {
    switch (action.type) {
        case INSTANCE_DISPATCH_ACTION.SET_LOADING_STATUS:
            return { ...state, loadingStatus: action.value };
        case INSTANCE_DISPATCH_ACTION.SET_INSTANCE:
            return {
                ...state,
                sdkInstance: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.RESOLVED,
            };
        case INSTANCE_DISPATCH_ACTION.SET_ELIGIBILITY:
            return { ...state, eligiblePaymentMethods: action.value };
        case INSTANCE_DISPATCH_ACTION.SET_ERROR:
            return {
                ...state,
                error: action.value,
                loadingStatus: INSTANCE_LOADING_STATE.REJECTED,
            };
        case INSTANCE_DISPATCH_ACTION.RESET_STATE:
            return {
                ...state,
                sdkInstance: null,
                eligiblePaymentMethods: null,
                error: null,
                loadingStatus: INSTANCE_LOADING_STATE.PENDING,
                createInstanceOptions: action.value.createInstanceOptions,
                scriptOptions: action.value.scriptOptions,
            };
        default:
            return state;
    }
}

export const InstanceContext = createContext<InstanceContextState | null>(null);
