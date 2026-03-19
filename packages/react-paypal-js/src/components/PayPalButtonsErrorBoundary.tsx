import { Component } from "react";

import type { ErrorInfo, ReactNode } from "react";
import type { PayPalButtonOnError } from "@paypal/paypal-js";

/**
 * This component serves as an error boundary for the PayPalButtons component.
 * It catches any errors that occur during the rendering of the PayPalButtons
 * and provides an onError callback.
 */

interface PayPalButtonsErrorBoundaryProps {
    onError?: PayPalButtonOnError;
    children: ReactNode;
}

interface PayPalButtonsErrorBoundaryState {
    hasError: boolean;
}

export class PayPalButtonsErrorBoundary extends Component<
    PayPalButtonsErrorBoundaryProps,
    PayPalButtonsErrorBoundaryState
> {
    constructor(props: PayPalButtonsErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): PayPalButtonsErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // if onError callback is provided, call it with the error details
        // don't rethrow the error, as we want to prevent the entire app from crashing
        if (typeof this.props.onError === "function") {
            this.props.onError({
                message: error.message,
                name: error.name,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
            });
        } else {
            // if no onError callback is provided, log the error to the console
            console.error(
                "Error in PayPalButtons component:",
                error,
                errorInfo,
            );
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return null;
        }

        return this.props.children;
    }
}
