/**
 * Code snippets for V6 button stories documentation
 */

/**
 * Generates code snippet for PayPal One-Time Payment Button
 */
export function getPayPalOneTimePaymentCode(
    args: Record<string, unknown>,
): string {
    // TODO: Generate actual code based on args
    return `
import { PayPalProvider, PayPalOneTimePaymentButton } from '@paypal/react-paypal-js';

function App() {
    return (
        <PayPalProvider clientId="YOUR_CLIENT_ID">
            <PayPalOneTimePaymentButton
                orderId="YOUR_ORDER_ID"
                onApprove={(data) => {
                    console.log('Payment approved:', data);
                }}
                onError={(error) => {
                    console.error('Payment error:', error);
                }}
            />
        </PayPalProvider>
    );
}
`.trim();
}

/**
 * Generates code snippet for PayLater One-Time Payment Button
 */
export function getPayLaterOneTimePaymentCode(
    args: Record<string, unknown>,
): string {
    // TODO: Generate actual code based on args
    return `
import { PayPalProvider, PayLaterOneTimePaymentButton } from '@paypal/react-paypal-js';

function App() {
    return (
        <PayPalProvider clientId="YOUR_CLIENT_ID">
            <PayLaterOneTimePaymentButton
                orderId="YOUR_ORDER_ID"
                onApprove={(data) => {
                    console.log('Payment approved:', data);
                }}
                onError={(error) => {
                    console.error('Payment error:', error);
                }}
            />
        </PayPalProvider>
    );
}
`.trim();
}

/**
 * Generates code snippet for custom styled button
 */
export function getCustomStyledButtonCode(
    args: Record<string, unknown>,
): string {
    // TODO: Generate actual code based on args
    return `
import { PayPalProvider, PayPalOneTimePaymentButton } from '@paypal/react-paypal-js';

function App() {
    return (
        <PayPalProvider clientId="YOUR_CLIENT_ID">
            <PayPalOneTimePaymentButton
                orderId="YOUR_ORDER_ID"
                style={{
                    color: 'blue',
                    shape: 'pill',
                    label: 'pay',
                }}
                onApprove={(data) => {
                    console.log('Payment approved:', data);
                }}
            />
        </PayPalProvider>
    );
}
`.trim();
}
