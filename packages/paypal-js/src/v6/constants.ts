export const SCRIPT_LOADING_STATE = {
  PENDING: "pending",
  RESOLVED: "resolved",
  REJECTED: "rejected",
} as const;

export const DATA_ATTRIBUTE_LOADING_STATE = "data-loading-state";

export const MAX_SCRIPT_LOAD_ERROR_RETRIES = 2;
// Each script attempt may remain pending for this long before timing out.
export const SCRIPT_LOAD_TIMEOUT_MS = 30_000;
// Small base/cap so a full error-retry cycle adds at most a couple of seconds
// of latency on top of a script that's definitively failed to load.
export const RETRY_BASE_DELAY_MS = 50;
export const RETRY_MAX_DELAY_MS = 400;
