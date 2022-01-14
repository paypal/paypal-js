import type { Args } from "@storybook/addons/dist/ts3.9/types";

const IMPORT_STATEMENT = `import { useState, useEffect } from "react";
import {
	PayPalScriptProvider,
	BraintreePayPalButtons,
	usePayPalScriptReducer
} from "@paypal/react-paypal-js";`;

const AUTH_TOKEN_STATEMENT = `const [clientToken, setClientToken] = useState(null);

	useEffect(() => {
		(async () => {
			const response = await (
				await fetch(
					"https://braintree-sdk-demo.herokuapp.com/api/braintree/auth"
				)
			).json();
			setClientToken(response?.client_token || response?.clientToken);
		})();
	}, []);`;

const getButtonWrapper = (args: Args) =>
    `// Custom component to wrap the PayPalButtons and handle currency changes
const ButtonWrapper = ({ currency }) => {
	// usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [currency]);

	return (<BraintreePayPalButtons
		style={style}
		disabled={${args.disabled}}
		fundingSource="${
            args.fundingSource || ""
        }" // Available values are: ["paypal", "card", "credit", "paylater", "venmo"]
		forceReRender={[style, amount]}
		createOrder={function (data, actions) {
			return actions.braintree
				.createPayment({
					flow: "checkout",
					amount: amount, // Here change the amount if needed
					currency: "${args.currency}", // Here change the currency if needed
					intent: "capture",
					enableShippingAddress: true,
					shippingAddressEditable: false,
					shippingAddressOverride: {
						recipientName: "Scruff McGruff",
						line1: "1234 Main St.",
						line2: "Unit 1",
						city: "Chicago",
						countryCode: "US",
						postalCode: "60652",
						state: "IL",
						phone: "123.456.7890",
					},
				})
				.then((orderId) => {
					// Your code here after create the order
					return orderId;
				});
		}}
		onApprove={function (data, actions) {
			return actions.braintree
				.tokenizePayment(data)
				.then((payload) => {
					// Your code here after capture the order
					console.log(JSON.stringify(payload));
				});
			}
		}
	/>);
};`;

const getProviderStatement = (args: { intent: string; vault: boolean }) =>
    `<PayPalScriptProvider
						options={{
							"client-id": "test",
							components: "buttons",
							// "data-user-id-token": "your-tokenization-key-here",
							"data-client-token": clientToken,
							intent: "${args.intent}",
							vault: ${args.vault},
						}}
						>`;

export const getDefaultCode = (args: Args): string =>
    `${IMPORT_STATEMENT}

// This values are the props in the UI
const style = ${JSON.stringify(args.style)};
const amount = "${args.amount}";

${getButtonWrapper(args)}

export default function App() {
	${AUTH_TOKEN_STATEMENT}

	return (
		<>
			{clientToken ? (
				<div style={{ maxWidth: "${args.size}px", minHeight: "200px" }}>
					${getProviderStatement({ intent: "capture", vault: false })}
						<ButtonWrapper currency={"${args.currency}"} />
					</PayPalScriptProvider>
				</div>
			) : (
				<h1>Loading token...</h1>
			)}
		</>
	);
}`;

export const getBillingAgreementCode = (args: Args): string =>
    `${IMPORT_STATEMENT}

// This values are the props in the UI
const style = ${JSON.stringify(args.style)};

${getButtonWrapper(args)}

export default function App() {
	${AUTH_TOKEN_STATEMENT}

	return (
		<>
			{clientToken ? (
				<div style={{ maxWidth: "750px", minHeight: "200px" }}>
					${getProviderStatement({ intent: "tokenize", vault: true })}
						<BraintreePayPalButtons
							style={style}
							disabled={${args.disabled}}
							fundingSource="${
                                args.fundingSource || ""
                            }" // Available values are: ["paypal", "card", "credit", "paylater", "venmo"]
							forceReRender={[style]}
							createBillingAgreement={function (data, actions) {
								return actions.braintree.createPayment({
									// Required
									flow: "vault",
					
									// The following are optional params
									billingAgreementDescription:
										"Your agreement description",
									enableShippingAddress: true,
									shippingAddressEditable: false,
									shippingAddressOverride: {
										recipientName: "Scruff McGruff",
										line1: "1234 Main St.",
										line2: "Unit 1",
										city: "Chicago",
										countryCode: "US",
										postalCode: "60652",
										state: "IL",
										phone: "123.456.7890",
									},
								});
							}}
							onApprove={function (data, actions) {
								return actions.braintree
									.tokenizePayment(data)
									.then((payload) => {
										// Your code here after capture the order
										console.log(JSON.stringify(payload));
									});
								}
							}
						/>
					</PayPalScriptProvider>
				</div>
			) : (
				<h1>Loading token...</h1>
			)}
		</>
	);
}`;
