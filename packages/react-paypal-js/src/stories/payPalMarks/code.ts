import {
    generateFundingSource,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";

import type { Args } from "@storybook/addons/dist/ts3.9/types";

export const getDefaultCode = (fundingSource?: string): string =>
    `import { PayPalScriptProvider, PayPalMarks } from "@paypal/react-paypal-js";

export default function App() {
	return (
		<PayPalScriptProvider
			options={{
				clientId: "test",
				components: "buttons,marks,funding-eligibility",
			}}
		>
			<PayPalMarks ${generateFundingSource(fundingSource)} />
		</PayPalScriptProvider>
	);
}`;

export const getRadioButtonsCode = (args: Args): string =>
    `import { useState } from "react";
import {
	PayPalScriptProvider,
	PayPalButtons,
	PayPalMarks,
} from "@paypal/react-paypal-js";

// This values are the props in the UI
const amount = "${args.amount}";
const currency = "${args.currency}";
const style = ${JSON.stringify(args.style)};

export default function App() {
	const fundingSources = ["paypal", "card", "paylater"];
	// Remember the amount props is received from the control panel
	const [selectedFundingSource, setSelectedFundingSource] = useState(
		fundingSources[0]
	);

	function onChange(event) {
		setSelectedFundingSource(event.target.value);
	}

	function createOrder() {
		// replace this url with your server
		return fetch("${CREATE_ORDER_URL}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			// use the "body" param to optionally pass additional order information
			// like product ids and quantities
			body: JSON.stringify({
				cart: [
					{
						sku: "1blwyeo8",
						quantity: 2,
					},
				],
			}),
		})
			.then((response) => response.json())
			.then((order) => {
				// Your code here after create the order
				return order.id;
			});
	}
	function onApprove(data) {
		// replace this url with your server
		return fetch("${CAPTURE_ORDER_URL}", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				orderID: data.orderID,
			}),
		})
			.then((response) => response.json())
			.then((orderData) => {
				// Your code here after capture the order
			});
	}

	return (
		<PayPalScriptProvider
			options={{
				clientId: "test",
				components: "buttons,marks,funding-eligibility"
			}}
		>
			<form style={{ minHeight: "200px" }}>
				{fundingSources.map((fundingSource) => (
					<label className="mark" key={fundingSource}>
						<input
							defaultChecked={
								fundingSource === selectedFundingSource
							}
							onChange={onChange}
							type="radio"
							name="fundingSource"
							value={fundingSource}
						/>
						<PayPalMarks fundingSource={fundingSource} />
					</label>
				))}
			</form>
			<br />
			<PayPalButtons
				fundingSource={selectedFundingSource}
				style={style}
				forceReRender={[selectedFundingSource, style, amount, currency]}
				createOrder={createOrder}
				onApprove={onApprove}
			/>
		</PayPalScriptProvider>
	);
}`;
