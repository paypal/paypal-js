import { SUBSCRIPTION } from "../constants";

const SUBSCRIPTION_OPTIONS = `createSubscription={(data, actions) => {
			return actions.subscription
				.create({
					plan_id: "P-3RX065706M3469222L5IFM4I",
				})
				.then((orderId) => {
					// Your code here after create the order
					return orderId;
				});
		}}
		style={{
			label: "subscribe",
		}}`;

const CAPTURE_OPTIONS = `createOrder={function (data, actions) {
			return actions.order
				.create({
					purchase_units: [
						{
							amount: {
								value: "2",
							},
						},
					],
				})
				.then((orderId) => {
					// Your code here after create the order
					return orderId;
				});
		}}
		onApprove={function (data, actions) {
			return actions.order.capture().then(function (details) {
				// Your code here after capture the order
			});
		}}`;

export const getDefaultCode = (type: string): string =>
    `import { useEffect } from "react";
import {
	PayPalScriptProvider,
	PayPalButtons,
	usePayPalScriptReducer
} from "@paypal/react-paypal-js";

const ButtonWrapper = ({ type }) => {
	const [{ options }, dispatch] = usePayPalScriptReducer();

	useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                intent: "${type === SUBSCRIPTION ? "subscription" : "capture"}",
            },
        });
    }, [type]);

	return (<PayPalButtons
		${type === SUBSCRIPTION ? SUBSCRIPTION_OPTIONS : CAPTURE_OPTIONS}
	/>);
}

export default function App() {
	return (
		<PayPalScriptProvider
			options={{
				clientId: "test",
				components: "buttons",
				intent: "${type}",
				vault: ${type === SUBSCRIPTION},
			}}
		>
			<ButtonWrapper type="${type}" />
		</PayPalScriptProvider>
	);
}`;
