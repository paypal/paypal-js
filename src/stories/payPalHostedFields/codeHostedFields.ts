import type { Args } from "@storybook/addons/dist/ts3.9/types";

const EXPIRATION_DATE_SINGLE_FIELD = `<label htmlFor="card-number">
                            Card Number
                            <span style={INVALID_COLOR}>*</span>
                        </label>
                        <PayPalHostedField
                            id="card-number"
                            className="card-field"
                            style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="number"
                            options={{
                                selector: "#card-number",
                                placeholder: "4111 1111 1111 1111",
                            }}
                        />
                        <label htmlFor="cvv">
                            CVV<span style={INVALID_COLOR}>*</span>
                        </label>
                        <PayPalHostedField
                            id="cvv"
                            className="card-field"
                            style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="cvv"
                            options={{
                                selector: "#cvv",
                                placeholder: "123",
                                maskInput: true,
                            }}
                        />
                        <label htmlFor="expiration-date">
                            Expiration Date
                            <span style={INVALID_COLOR}>*</span>
                        </label>
                        <PayPalHostedField
                            id="expiration-date"
                            className="card-field"
                            style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="expirationDate"
                            options={{
                                selector: "#expiration-date",
                                placeholder: "MM/YYYY",
                            }}
                        />`;

const EXPIRATION_DATE_MULTI_FIELD = `<PayPalHostedField
                            id="card-number"
                            className="card-field"
							style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="number"
                            options={{
                                selector: "#card-number",
                                placeholder: "4111 1111 1111 1111",
                            }}
                        />
                        <PayPalHostedField
                            id="cvv"
                            className="card-field"
							style={CUSTOM_FIELD_STYLE}
                            hostedFieldType="cvv"
                            options={{
                                selector: "#cvv",
                                placeholder: "123",
                                maskInput: true,
                            }}
                        />
                        <PayPalHostedField
							id="expiration-month-1"
							style={CUSTOM_FIELD_STYLE}
							className="card-field"
							hostedFieldType="expirationMonth"
							options={{
								selector: "#expiration-month-1",
								placeholder: "MM",
							}}
						/>
						<PayPalHostedField
							id="expiration-year-1"
							style={CUSTOM_FIELD_STYLE}
                            className="card-field"
							hostedFieldType="expirationYear"
							options={{
								selector: "#expiration-year-1",
								placeholder: "YYYY",
							}}
						/>`;

const CUSTOM_INPUT = `<input
				id="card-holder"
				ref={cardHolderName}
				className="card-field"
				style={{ ...customStyle, outline: "none" }}
				type="text"
				placeholder="Full name"
				/>`;

const CUSTOM_INPUT_WITH_LABEL = `<label title="This represents the full name as shown in the card">
				Card Holder Name
				<input
					id="card-holder"
					ref={cardHolderName}
					className="card-field"
					style={{ ...customStyle, outline: "none" }}
					type="text"
					placeholder="Full name"
				/>
				</label>`;

const getCode = (
    {
        customCardNameField,
        expirationDateFieldType,
    }: { expirationDateFieldType: string; customCardNameField: string },
    args: Args
): string =>
    `import { useState, useEffect, useRef } from "react";
import {
	PayPalScriptProvider,
	PayPalHostedFieldsProvider,
	PayPalHostedField,
	usePayPalHostedFields,
} from "@paypal/react-paypal-js";

const CUSTOM_FIELD_STYLE = ${JSON.stringify(args.style)};
const INVALID_COLOR = {
	color: "#dc3545",
};

// Example of custom component to handle form submit
const SubmitPayment = ({ customStyle }) => {
	const [paying, setPaying] = useState(false);
	const cardHolderName = useRef(null);
	const hostedField = usePayPalHostedFields();

	const handleClick = () => {
		if (!hostedField?.cardFields) {
            const childErrorMessage = 'Unable to find any child components in the <PayPalHostedFieldsProvider />';

            action(ERROR)(childErrorMessage);
            throw new Error(childErrorMessage);
        }
		const isFormInvalid =
			Object.values(hostedField.cardFields.getState().fields).some(
				(field) => !field.isValid
			) || !cardHolderName?.current?.value;

		if (isFormInvalid) {
			return alert(
				"The payment form is invalid"
			);
		}
		setPaying(true);
		hostedField.cardFields
			.submit({
				cardholderName: cardHolderName?.current?.value,
			})
			.then((data) => {
				// Your logic to capture the transaction
				fetch("url_to_capture_transaction", {
					method: "POST",
				})
					.then((response) => response.json())
					.then((data) => {
						// Here use the captured info
					})
					.catch((err) => {
						// Here handle error
					})
					.finally(() => {
						setPaying(false);
					});
			})
			.catch((err) => {
				// Here handle error
				setPaying(false);
			});
	};

	return (
		<>
            ${customCardNameField}
			<button
				className={\`btn\${paying ? "" : " btn-primary"}\`}
				style={{ float: "right" }}
				onClick={handleClick}
			>
				{paying ? <div className="spinner tiny" /> : "Pay"}
			</button>
		</>
	);
};

export default function App() {
	const [clientToken, setClientToken] = useState(null);

	useEffect(() => {
		(async () => {
			const response = await (
				await fetch(
					"https://react-paypal-js-storybook.fly.dev/api/paypal/generate-client-token"
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
						"client-id":
							"AdOu-W3GPkrfuTbJNuW9dWVijxvhaXHFIRuKrLDwu14UDwTTHWMFkUwuu9D8I1MAQluERl9cFOd7Mfqe",
						components: "buttons,hosted-fields",
						"data-client-token": clientToken,
						intent: "capture",
						vault: false,
					}}
				>
					<PayPalHostedFieldsProvider
						styles={${JSON.stringify(args.styles)}}
						createOrder={function () {
							return fetch(
								"your_custom_server_to_create_orders",
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({
										purchase_units: [
											{
												amount: {
													value: "${args.amount}", // Here change the amount if needed
													currency_code: "USD", // Here change the currency if needed
												},
											},
										],
										intent: "capture",
									}),
								}
							)
								.then((response) => response.json())
								.then((order) => {
									// Your code here after create the order
									return order.id;
								})
								.catch((err) => {
									alert(err);
								});
						}}
					>
                        ${expirationDateFieldType}
						<SubmitPayment customStyle={${JSON.stringify(args.style)}} />
					</PayPalHostedFieldsProvider>
				</PayPalScriptProvider>
			) : (
				<h1>Loading token...</h1>
			)}
		</>
	);
}`;

export const getDefaultCode = (args: Args): string =>
    getCode(
        {
            customCardNameField: CUSTOM_INPUT_WITH_LABEL,
            expirationDateFieldType: EXPIRATION_DATE_SINGLE_FIELD,
        },
        args
    );
export const getExpirationDateCode = (args: Args): string =>
    getCode(
        {
            customCardNameField: CUSTOM_INPUT,
            expirationDateFieldType: EXPIRATION_DATE_MULTI_FIELD,
        },
        args
    );
