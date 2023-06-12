export const getDefaultCode = (styles: Record<string, unknown>): string =>
    `import { useState, useEffect } from "react";
import {
	PayPalScriptProvider,
	PayPalHostedFieldsProvider,
	PayPalHostedField,
} from "@paypal/react-paypal-js";

export default function App() {
	const [clientToken, setClientToken] = useState(null);

	useEffect(() => {
		(async () => {
			const response = await (
				await fetch(
					"https://react-paypal-js-storybook.fly.dev/api/paypal/generate-client-token",
					{ method: "POST" }
				)
			).json();
			setClientToken(response?.client_token || response?.clientToken);
		})();
	}, []);

	return (
		<>
			{clientToken ? (
				<PayPalScriptProvider
					options={{
						clientId:
							"AdOu-W3GPkrfuTbJNuW9dWVijxvhaXHFIRuKrLDwu14UDwTTHWMFkUwuu9D8I1MAQluERl9cFOd7Mfqe",
						components: "buttons,hosted-fields",
						dataClientToken: clientToken,
						intent: "capture",
						vault: false,
					}}
				>
					<PayPalHostedFieldsProvider
						createOrder={() => {
							// Here your server call to create the order
							return Promise.resolve("7NE43326GP4951156"); // This is a mock result
						}}
						styles={${JSON.stringify(styles)}}
					>
						<PayPalHostedField
							id="card-number"
							className="card-field"
							hostedFieldType="number"
							options={{
								selector: "#card-number",
								placeholder: "4111 1111 1111 1111",
							}}
						/>
						<PayPalHostedField
							id="cvv"
							className="card-field"
							hostedFieldType="cvv"
							options={{
								selector: "#cvv",
								placeholder: "123",
								maskInput: {
									character: "#",
								},
							}}
						/>
						<PayPalHostedField
							id="expiration-date"
							className="card-field"
							hostedFieldType="expirationDate"
							options={{
								selector: "#expiration-date",
								placeholder: "MM/YYYY",
							}}
						/>
					</PayPalHostedFieldsProvider>
				</PayPalScriptProvider>
			) : (
				<h1>Loading token...</h1>
			)}
		</>
	);
}`;
