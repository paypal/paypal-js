import React, { useEffect } from "react";
import type { Decorator } from "@storybook/react";
import { action } from "storybook/actions";

import {
  PayPalProvider,
  usePayPal,
  INSTANCE_LOADING_STATE,
} from "@paypal/react-paypal-js/sdk-v6";
import { PAYPAL_CLIENT_ID } from "../shared/utils";

function SdkStatusMonitor({ children }: { children: React.ReactNode }) {
  const { loadingStatus } = usePayPal();

  useEffect(() => {
    if (loadingStatus === INSTANCE_LOADING_STATE.RESOLVED) {
      action("SDK")("Library initialized and rendered");
    }
  }, [loadingStatus]);

  const handleClick = (e: React.MouseEvent) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag.endsWith("-button")) {
      action("button")("Click event dispatched from the LPM payment button");
    }
  };

  return <div onClick={handleClick}>{children}</div>;
}

function LPMProviderWrapper({
  children,
  lpmComponent,
}: {
  children: React.ReactNode;
  lpmComponent: string;
}) {
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div
        style={{
          padding: "1rem",
          border: "1px solid #e53e3e",
          borderRadius: "4px",
          backgroundColor: "#fff5f5",
          color: "#c53030",
        }}
      >
        <strong>Missing environment variable</strong>
        <p style={{ margin: "0.5rem 0 0" }}>
          <code>STORYBOOK_PAYPAL_SANDBOX_CLIENT_ID</code> is not set. Copy{" "}
          <code>.env.example</code> to <code>.env</code> and add your sandbox
          client ID from{" "}
          <a
            href="https://developer.paypal.com/dashboard/applications/sandbox"
            target="_blank"
            rel="noreferrer"
          >
            developer.paypal.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <PayPalProvider
      clientId={PAYPAL_CLIENT_ID}
      environment="sandbox"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      components={[lpmComponent] as any}
      pageType="checkout"
    >
      <SdkStatusMonitor>{children}</SdkStatusMonitor>
    </PayPalProvider>
  );
}

/**
 * Decorator for LPM stories. Reads `parameters.lpmComponent` from story context
 * and wraps the story with a PayPalProvider that loads only that LPM component.
 *
 * Usage in a story file:
 *   parameters: { lpmComponent: "ideal-payments", providerType: "lpm" }
 *   decorators: [withLPMPayPalProvider]
 */
export const withLPMPayPalProvider: Decorator = (Story, context) => {
  const lpmComponent = context.parameters?.lpmComponent as string;

  return (
    <LPMProviderWrapper lpmComponent={lpmComponent}>
      <Story />
    </LPMProviderWrapper>
  );
};
