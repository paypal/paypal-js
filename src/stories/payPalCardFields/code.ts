import { CREATE_ORDER_URL, CAPTURE_ORDER_URL } from "../utils";

import type { Args } from "@storybook/addons/dist/ts3.9/types";

export const getFormCode = (): string => {
    return `
	import React, { useState } from "react";
	import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

	import {
		PayPalScriptProvider,
		usePayPalCardFields,
		PayPalCardFieldsProvider,
		PayPalCardFieldsForm,
	} from "@paypal/react-paypal-js";

	export default function App(): JSX.Element {
		const [isPaying, setIsPaying] = useState(false);
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
					<PayPalCardFieldsForm />
					{/* Custom client component to handle card fields submit */}
					<SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
				</PayPalCardFieldsProvider>
			</PayPalScriptProvider>
		);
	}

	const SubmitPayment: React.FC<{
		setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
		isPaying: boolean;
	}> = ({ isPaying, setIsPaying }) => {
		const { cardFieldsForm, fields } = usePayPalCardFields();

		const handleClick = async () => {
			if (!cardFieldsForm) {
				const childErrorMessage =
					"Unable to find any child components in the <PayPalHostedFieldsProvider />";

				throw new Error(childErrorMessage);
			}
			const formState = await cardFieldsForm.getState();

			if (!formState.isFormValid) {
				return alert("The payment form is invalid");
			}
			setIsPaying(true);

			cardFieldsForm.submit().catch((err) => {
				setIsPaying(false);
			});
		};

		return (
			<button
				className={isPaying ? "btn" : "btn btn-primary"}
				style={{ float: "right" }}
				onClick={handleClick}
			>
				{isPaying ? <div className="spinner tiny" /> : "Pay"}
			</button>
		);
	};

	`;
};

export const getIndividualFieldCode = (): string => {
    return `
	import React, { useState } from "react";
	import type { CardFieldsOnApproveData } from "@paypal/paypal-js";

	import {
    PayPalScriptProvider,
    usePayPalCardFields,
    PayPalCardFieldsProvider,
    PayPalCVVField,
    PayPalExpiryField,
    PayPalNameField,
    PayPalNumberField,
	} from "@paypal/react-paypal-js";

	export default function App(): JSX.Element {
		const [isPaying, setIsPaying] = useState(false);
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
				<PayPalNameField />
				<PayPalNumberField />
				<PayPalExpiryField />
				<PayPalCVVField />
					<SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
				</PayPalCardFieldsProvider>
			</PayPalScriptProvider>
		);
	}

	const SubmitPayment: React.FC<{
		setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
		isPaying: boolean;
	}> = ({ isPaying, setIsPaying }) => {
		const { cardFieldsForm } = usePayPalCardFields();

		const handleClick = async () => {
			if (!cardFieldsForm) {
				const childErrorMessage =
					"Unable to find any child components in the <PayPalHostedFieldsProvider />";

				throw new Error(childErrorMessage);
			}
			const formState = await cardFieldsForm.getState();

			if (!formState.isFormValid) {
				return alert("The payment form is invalid");
			}
			setIsPaying(true);

			cardFieldsForm.submit().catch((err) => {
				setIsPaying(false);
			});
		};

		return (
			<button
				className={isPaying ? "btn" : "btn btn-primary"}
				style={{ float: "right" }}
				onClick={handleClick}
			>
				{isPaying ? <div className="spinner tiny" /> : "Pay"}
			</button>
		);
	};

	`;
};
