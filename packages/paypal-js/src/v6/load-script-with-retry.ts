import type { PayPalV6Namespace } from "../../types/v6/index";
import {
  DATA_ATTRIBUTE_LOADING_STATE,
  MAX_SCRIPT_LOAD_ERROR_RETRIES,
  MAX_SCRIPT_LOAD_TIMEOUT_RETRIES,
  RETRY_BASE_DELAY_MS,
  RETRY_MAX_DELAY_MS,
  SCRIPT_LOADING_STATE,
  SCRIPT_LOAD_TIMEOUT_MS,
} from "./constants";
import { createScriptElement, getPayPalWindowNamespace } from "./dom";

function getRetryDelayMs(retryCount: number): number {
  const exponential = Math.min(
    RETRY_BASE_DELAY_MS * 2 ** (retryCount - 1),
    RETRY_MAX_DELAY_MS,
  );
  return exponential + Math.random() * exponential * 0.5;
}

function withCacheBustingParam(url: URL, attempt: number): URL {
  const retryUrl = new URL(url.toString());
  retryUrl.searchParams.set("paypal-sdk-retry", String(attempt));
  return retryUrl;
}

export function loadScriptWithRetry({
  url,
  namespace,
  dataNamespace,
  dataSdkIntegrationSource,
  attempt = 0,
  timeoutRetryCount = 0,
  startTime = Date.now(),
}: {
  url: URL;
  namespace: string;
  dataNamespace: string | undefined;
  dataSdkIntegrationSource: string | undefined;
  attempt?: number;
  timeoutRetryCount?: number;
  startTime?: number;
}): Promise<PayPalV6Namespace> {
  const isRetry = attempt > 0;
  const scriptUrl = isRetry ? withCacheBustingParam(url, attempt) : url;

  const scriptElement =
    (!isRetry &&
      document.querySelector<HTMLScriptElement>(
        `script[src*="${url.pathname}"][${DATA_ATTRIBUTE_LOADING_STATE}="${SCRIPT_LOADING_STATE.PENDING}"]`,
      )) ||
    createScriptElement({
      url: scriptUrl.toString(),
      attributes: {
        "data-namespace": dataNamespace,
        "data-sdk-integration-source": dataSdkIntegrationSource,
        [DATA_ATTRIBUTE_LOADING_STATE]: SCRIPT_LOADING_STATE.PENDING,
      },
    });

  return new Promise<PayPalV6Namespace>((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      clearTimeout(timeoutId);
      scriptElement.removeEventListener("load", handleLoad);
      scriptElement.removeEventListener("error", handleError);
    };

    const handleLoad = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();

      const paypalWindowReference = getPayPalWindowNamespace(namespace);

      if (!paypalWindowReference) {
        scriptElement.setAttribute(
          DATA_ATTRIBUTE_LOADING_STATE,
          SCRIPT_LOADING_STATE.REJECTED,
        );

        return reject(
          `The window.${namespace} global variable is not available`,
        );
      }
      scriptElement.setAttribute(
        DATA_ATTRIBUTE_LOADING_STATE,
        SCRIPT_LOADING_STATE.RESOLVED,
      );
      return resolve(paypalWindowReference);
    };

    const retry = (nextTimeoutRetryCount: number) => {
      setTimeout(
        () => {
          resolve(
            loadScriptWithRetry({
              url,
              namespace,
              dataNamespace,
              dataSdkIntegrationSource,
              attempt: attempt + 1,
              timeoutRetryCount: nextTimeoutRetryCount,
              startTime,
            }),
          );
        },
        getRetryDelayMs(attempt + 1),
      );
    };

    const failScript = () => {
      scriptElement.setAttribute(
        DATA_ATTRIBUTE_LOADING_STATE,
        SCRIPT_LOADING_STATE.REJECTED,
      );
      scriptElement.remove();
    };

    const handleTimeout = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      failScript();

      if (timeoutRetryCount < MAX_SCRIPT_LOAD_TIMEOUT_RETRIES) {
        retry(timeoutRetryCount + 1);
        return;
      }

      return reject(
        new Error(
          `The script "${url.toString()}" timed out after ${
            timeoutRetryCount + 1
          } attempt(s) totaling ${
            Date.now() - startTime
          }ms, exceeding the ${SCRIPT_LOAD_TIMEOUT_MS}ms timeout on the final attempt.`,
        ),
      );
    };

    const handleError = () => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      failScript();

      if (attempt < MAX_SCRIPT_LOAD_ERROR_RETRIES) {
        retry(timeoutRetryCount);
        return;
      }

      return reject(
        new Error(
          `The script "${url.toString()}" failed to load after ${
            attempt + 1
          } attempt(s) totaling ${
            Date.now() - startTime
          }ms. Check the HTTP status code and response body in DevTools to learn more.`,
        ),
      );
    };

    const timeoutId = setTimeout(handleTimeout, SCRIPT_LOAD_TIMEOUT_MS);

    scriptElement.addEventListener("load", handleLoad);
    scriptElement.addEventListener("error", handleError);
  });
}
