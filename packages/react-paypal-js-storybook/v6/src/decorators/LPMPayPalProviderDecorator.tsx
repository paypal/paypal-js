import React, { useEffect, useState } from "react";
import type { Decorator } from "@storybook/react";
import { action } from "storybook/actions";

import {
  PayPalProvider,
  usePayPal,
  INSTANCE_LOADING_STATE,
  LPM_REGISTRY,
} from "@paypal/react-paypal-js/sdk-v6";
import type { LPMName } from "@paypal/react-paypal-js/sdk-v6";
import { SAMPLE_INTEGRATION_API, STORYBOOK_SDK_BASE_URL } from "../shared/utils";

function SdkStatusMonitor({ children }: { children: React.ReactNode }) {
  const { loadingStatus } = usePayPal();

  useEffect(() => {
    if (loadingStatus === INSTANCE_LOADING_STATE.RESOLVED) {
      action("SDK")("Library initialized and rendered");
    }
  }, [loadingStatus]);

  return <>{children}</>;
}

type TokenState =
  | { phase: "loading" }
  | { phase: "ready"; token: string }
  | { phase: "error"; message: string; isVpn: boolean };

function LPMProviderWrapper({
  lpm,
  testBuyerCountry,
  children,
}: {
  lpm: LPMName;
  testBuyerCountry?: string;
  children: React.ReactNode;
}) {
  const config = LPM_REGISTRY[lpm];
  const [tokenState, setTokenState] = useState<TokenState>({ phase: "loading" });

  // Fetch a browser-safe clientToken from the local API server.
  // We resolve the token ourselves so a rejected promise never reaches PayPalProvider.
  useEffect(() => {
    setTokenState({ phase: "loading" });
    let cancelled = false;

    fetch(`${SAMPLE_INTEGRATION_API}/client-token?lpm=${lpm}`, {
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => {
        if (!r.ok) {
          return r.json().then((d: { error?: string }) => {
            const err = Object.assign(new Error(d.error ?? `HTTP ${r.status}`), {
              httpStatus: r.status,
            });
            throw err;
          });
        }
        return r.json();
      })
      .then((d: { clientToken: string }) => {
        if (!d.clientToken) throw new Error("Server returned no clientToken");
        if (!cancelled) setTokenState({ phase: "ready", token: d.clientToken });
      })
      .catch((err: Error & { httpStatus?: number }) => {
        if (cancelled) return;

        const isTimeout = err.name === "AbortError";
        const isVpn = err.httpStatus === 503;
        const isNotFound = err.httpStatus === 404;

        let message: string;
        if (isTimeout) {
          message = `⏱️ Request timeout — the integration server may be unavailable.\n\nTry setting STORYBOOK_PAYPAL_API_URL environment variable to point to a local server.`;
        } else if (isVpn) {
          message = `⚠️ ${lpm} requires stage/VPN access — not available in sandbox.\n\n${err.message}`;
        } else if (isNotFound) {
          message = `⚠️ ${lpm} credentials not available on this server.\n\nThis LPM may require VPN/stage access or credentials not configured.\n\nError: ${err.message}`;
        } else {
          message = `❌ Failed to load credentials for ${lpm}.\n${err.message}`;
        }

        setTokenState({
          phase: "error",
          isVpn: isVpn || isTimeout,
          message,
        });
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lpm]);

  if (tokenState.phase === "loading") {
    return <div style={{ padding: "1rem", color: "#718096" }}>Loading credentials…</div>;
  }

  if (tokenState.phase === "error") {
    return (
      <div
        style={{
          padding: "1rem",
          border: `1px solid ${tokenState.isVpn ? "#d69e2e" : "#e53e3e"}`,
          borderRadius: "4px",
          backgroundColor: tokenState.isVpn ? "#fffbeb" : "#fff5f5",
          color: tokenState.isVpn ? "#744210" : "#c53030",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
          fontSize: "0.85rem",
        }}
      >
        {tokenState.message}
      </div>
    );
  }

  return (
    // key includes lpm + testBuyerCountry so the provider remounts when either
    // changes, loading the correct component bundle and buyer-country eligibility.
    <PayPalProvider
      key={`${lpm}-${testBuyerCountry ?? ""}`}
      clientToken={tokenState.token}
      components={[config.component]}
      pageType="checkout"
      testBuyerCountry={testBuyerCountry}
      sdkBaseUrl={STORYBOOK_SDK_BASE_URL}
    >
      <SdkStatusMonitor>{children}</SdkStatusMonitor>
    </PayPalProvider>
  );
}

export const withLPMPayPalProvider: Decorator = (Story, context) => {
  const lpm = (context.args.lpm as LPMName) ?? "ideal";
  const testBuyerCountry = context.args.testBuyerCountry as string | undefined;

  return (
    <LPMProviderWrapper lpm={lpm} testBuyerCountry={testBuyerCountry}>
      <Story />
    </LPMProviderWrapper>
  );
};
