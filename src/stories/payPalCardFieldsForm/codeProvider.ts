export const getDefaultCode = (): string =>
    `import { useState, useEffect } from "react";
import {
	PayPalScriptProvider,
	PayPalCardFieldsProvider,
	PayPalNameField,
    PayPalNumberField,
    PayPalExpiryField,
    PayPalCVVField
} from "../../index";
// } from "@paypal/react-paypal-js";

export default function App() {

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
				createOrder={() => {
					// Here your server call to create the order
					return Promise.resolve("7NE43326GP4951156"); // This is a mock result
				}}
                onApprove={() => {
					// Here your server call to capture the order
				}}
                onError={(err) => {
                    console.log(err);
                }}
            >
                <PayPalNameField />
                <PayPalNumberField />
                <PayPalExpiryField />
                <PayPalCVVField />
                {/* Custom client component to handle card fields submit */}
                <SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
            </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
	);
};

const SubmitPayment: React.FC<{
    isPaying: boolean;
    setIsPaying: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isPaying, setIsPaying }) => {
    const { cardFieldsForm } = usePayPalCardFields();

    const handleClick = async () => {
        if (!cardFieldsForm) {
            throw new Error("Unable to find any child components in the <PayPalHostedFieldsProvider />");
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
            className={isPaying ? 'btn btn-primary': 'btn'}
            style={{ float: "right" }}
            onClick={handleClick}
        >
            {isPaying ? <div className="spinner tiny" /> : "Pay"}
        </button>
    );
};`;
