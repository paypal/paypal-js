import { CREATE_ORDER_URL, CAPTURE_ORDER_URL } from "../utils";

import type { Args } from "@storybook/addons/dist/ts3.9/types";

export const getFormCode = (args: Args): string => {
    return `
	import React, { useState } from "react";
	import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

	import {
		PayPalScriptProvider,
		// usePayPalCardFields,
		PayPalCardFieldsProvider,
		// PayPalCardFieldsForm,
	} from "src/index.ts";

		async function createOrder() {
			return fetch("${CREATE_ORDER_URL}", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
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
					return order.id;
				})
				.catch((err) => {
					console.error(err);
				});
		}

		function onApprove(data: CardFieldsOnApproveData) {
			fetch("${CAPTURE_ORDER_URL}", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ orderID: data.orderID }),
			})
				.then((response) => response.json())
				.then((data) => {
					setIsPaying(false);
				})
				.catch((err) => {
					console.error(err);
				});
		}

	export default function App(): JSX.Element {
		const [isPaying, setIsPaying] = useState(false);
		return (
			<PayPalScriptProvider
				options={{
					clientId:
						"AduyjUJ0A7urUcWtGCTjanhRBSzOSn9_GKUzxWDnf51YaV1eZNA0ZAFhebIV_Eq-daemeI7dH05KjLWm",
					components: "card-fields",
				}}
			>
				<PayPalCardFieldsProvider
				createOrder={createOrder}
				onApprove={onApprove}
				onError={(err) => {
					console.log(err);
				}}
			>
			 </PayPalCardFieldsProvider>
			</PayPalScriptProvider>
		);
	}


	`;
};
