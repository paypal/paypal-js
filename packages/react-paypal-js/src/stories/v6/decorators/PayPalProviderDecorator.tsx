import React, { useState, useEffect, type ReactElement } from "react";

import { PayPalProvider } from "../../../v6";
import { SAMPLE_INTEGRATION_API } from "../shared/api";

async function fetchClientToken(): Promise<string> {
    const response = await fetch(
        `${SAMPLE_INTEGRATION_API}/paypal-api/auth/browser-safe-client-token`,
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch client token: ${response.status}`);
    }

    const data = await response.json();
    return data.accessToken;
}

function LoadingSpinner() {
    return (
        <div style={{ padding: "40px", textAlign: "center", color: "#0070ba" }}>
            <div
                style={{
                    display: "inline-block",
                    width: "32px",
                    height: "32px",
                    border: "3px solid rgba(0, 112, 186, 0.2)",
                    borderTopColor: "#0070ba",
                    borderRadius: "50%",
                    animation: "v6-spin 0.8s linear infinite",
                }}
            />
            <p style={{ marginTop: "12px", fontSize: "14px" }}>
                Loading PayPal SDK...
            </p>
            <style>{`@keyframes v6-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function ErrorDisplay({ message }: { message: string }) {
    return (
        <div
            style={{
                padding: "20px",
                backgroundColor: "#fef3cd",
                border: "1px solid #ffc107",
                borderRadius: "4px",
                color: "#856404",
            }}
        >
            <strong>Failed to load PayPal SDK</strong>
            <p style={{ margin: "8px 0", fontSize: "14px" }}>{message}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                Ensure the sample integration server is running at{" "}
                {SAMPLE_INTEGRATION_API}
            </p>
        </div>
    );
}

function ProviderWrapper({ children }: { children: React.ReactNode }) {
    const [clientToken, setClientToken] = useState<string>();
    const [error, setError] = useState<Error>();

    useEffect(() => {
        fetchClientToken().then(setClientToken).catch(setError);
    }, []);

    if (error) {
        return <ErrorDisplay message={error.message} />;
    }

    if (!clientToken) {
        return <LoadingSpinner />;
    }

    return (
        <PayPalProvider
            clientToken={clientToken}
            components={[
                "paypal-payments",
                "venmo-payments",
                "paypal-guest-payments",
            ]}
            pageType="checkout"
        >
            {children}
        </PayPalProvider>
    );
}

export function withPayPalProvider(Story: () => ReactElement): ReactElement {
    return (
        <ProviderWrapper>
            <Story />
        </ProviderWrapper>
    );
}
