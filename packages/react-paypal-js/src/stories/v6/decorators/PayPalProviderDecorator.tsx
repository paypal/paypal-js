/**
 * V6-specific decorator that wraps stories with PayPalProvider
 * This ensures V6 stories are isolated from V5's PayPalScriptProvider
 *
 * @module PayPalProviderDecorator
 * @description Provides reusable decorators for Storybook v6 stories
 */

import React, { useMemo } from "react";
import type { DecoratorFn, StoryContext } from "@storybook/react";

// TODO: Import actual V6 PayPalProvider once available
// import { PayPalProvider } from "../../../v6";

/**
 * Configuration options for PayPal Provider decorator
 */
export interface PayPalProviderDecoratorOptions {
    /** PayPal client ID for SDK initialization */
    clientId?: string;
    /** Environment to use (sandbox or production) */
    environment?: "sandbox" | "production";
    /** Container width in pixels */
    containerWidth?: number;
    /** Container min height in pixels */
    containerMinHeight?: number;
    /** Additional PayPal SDK options */
    sdkOptions?: Record<string, unknown>;
}

/**
 * Props for the PayPal Provider wrapper component
 */
interface PayPalProviderWrapperProps extends PayPalProviderDecoratorOptions {
    children: React.ReactNode;
}

/**
 * Mock PayPalProvider for demonstration
 * Replace this with actual V6 PayPalProvider implementation
 *
 * @todo Replace with real PayPalProvider from v6 package
 */
const MockPayPalProvider = ({
    children,
    clientId,
    environment,
    sdkOptions,
}: {
    clientId: string;
    environment: string;
    sdkOptions?: Record<string, unknown>;
    children: React.ReactNode;
}) => {
    const contextValue = useMemo(
        () => ({
            clientId,
            environment,
            sdkOptions,
            isReady: true, // Mock ready state
        }),
        [clientId, environment, sdkOptions],
    );

    // TODO: Implement actual V6 provider logic
    return (
        <div
            data-v6-provider="true"
            data-client-id={clientId}
            data-env={environment}
            data-context={JSON.stringify(contextValue)}
        >
            {children}
        </div>
    );
};

/**
 * Wrapper component that provides consistent styling and layout
 */
const PayPalProviderWrapper = ({
    children,
    clientId = "test",
    environment = "sandbox",
    containerWidth = 750,
    containerMinHeight = 200,
    sdkOptions,
}: PayPalProviderWrapperProps) => {
    return (
        <div
            className="storybook-paypal-container"
            style={{
                maxWidth: `${containerWidth}px`,
                minHeight: `${containerMinHeight}px`,
                padding: "20px",
                margin: "0 auto",
            }}
        >
            <MockPayPalProvider
                clientId={clientId}
                environment={environment}
                sdkOptions={sdkOptions}
            >
                {children}
            </MockPayPalProvider>
        </div>
    );
};

/**
 * Creates a decorator that wraps stories with V6 PayPalProvider
 *
 * @param defaultOptions - Default configuration options
 * @returns Storybook decorator function
 *
 * @example Basic usage
 * ```tsx
 * export default {
 *   title: "V6/Buttons/PayPal",
 *   decorators: [createPayPalProviderDecorator()],
 * } as Meta;
 * ```
 *
 * @example With custom options
 * ```tsx
 * export default {
 *   title: "V6/Buttons/PayPal",
 *   decorators: [
 *     createPayPalProviderDecorator({
 *       environment: "production",
 *       containerWidth: 500,
 *     })
 *   ],
 * } as Meta;
 * ```
 *
 * @example Story-level overrides via args
 * ```tsx
 * export const Sandbox: Story = {
 *   args: {
 *     clientId: "custom-client-id",
 *     environment: "sandbox",
 *   },
 * };
 * ```
 */
export const createPayPalProviderDecorator = (
    defaultOptions: Partial<PayPalProviderDecoratorOptions> = {},
): DecoratorFn => {
    return (Story, context: StoryContext) => {
        // Merge default options, story parameters, and story args
        const options: PayPalProviderDecoratorOptions = {
            ...defaultOptions,
            ...context.parameters?.paypalProvider,
            // Story args take highest priority for runtime control
            ...(context.args?.clientId && { clientId: context.args.clientId }),
            ...(context.args?.environment && {
                environment: context.args.environment,
            }),
            ...(context.args?.containerWidth && {
                containerWidth: context.args.containerWidth,
            }),
        };

        return (
            <PayPalProviderWrapper {...options}>
                <Story />
            </PayPalProviderWrapper>
        );
    };
};

/**
 * Default V6 decorator with standard sandbox configuration
 * Use this for most PayPal component stories
 *
 * @example
 * ```tsx
 * import { withPayPalProvider } from "../decorators";
 *
 * export default {
 *   title: "V6/Buttons/PayPalButton",
 *   component: PayPalButton,
 *   decorators: [withPayPalProvider],
 * } as Meta<typeof PayPalButton>;
 * ```
 */
export const withPayPalProvider = createPayPalProviderDecorator();

/**
 * Production environment decorator
 * Use for testing production-specific behavior
 */
export const withPayPalProviderProduction = createPayPalProviderDecorator({
    environment: "production",
});

/**
 * Compact container decorator for small components
 * Useful for marks, badges, or small UI elements
 */
export const withPayPalProviderCompact = createPayPalProviderDecorator({
    containerWidth: 400,
    containerMinHeight: 100,
});
