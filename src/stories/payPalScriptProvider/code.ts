export const getDefaultCode = (deferLoading: boolean): string =>
    `import {
	PayPalScriptProvider,
	usePayPalScriptReducer,
	getScriptID,
	destroySDKScript,
} from "@paypal/react-paypal-js";

const SCRIPT_PROVIDER_OPTIONS = {
	clientId: "test",
};

// Custom loader component
const LoadScriptButton = () => {
	const [{ isResolved }, dispatch] = usePayPalScriptReducer();

	return (
		<div style={{ display: "inline-flex" }}>
			<button
				type="button"
				style={{ display: "block", marginBottom: "20px" }}
				disabled={isResolved}
				onClick={() => {
					dispatch({
						type: "setLoadingStatus",
						value: "pending",
					});
				}}
			>
				Load PayPal script
			</button>
			<button
				type="button"
				style={{
					display: "block",
					marginBottom: "20px",
					marginLeft: "1em",
				}}
				onClick={() => {
					destroySDKScript(getScriptID(SCRIPT_PROVIDER_OPTIONS));
					dispatch({
						type: "setLoadingStatus",
						value: "initial",
					});
				}}
			>
				Reset
			</button>
		</div>
	);
};

// Show state
function PrintLoadingState() {
	const [{ isInitial, isPending, isResolved, isRejected }] =
		usePayPalScriptReducer();
	let status = "no status";

	if (isInitial) {
		status = "initial";
	} else if (isPending) {
		status = "pending";
	} else if (isResolved) {
		status = "resolved";
	} else if (isRejected) {
		status = "rejected";
	}

	return <div>Current status: {status}</div>;
}

export default function App() {
	return (
		<PayPalScriptProvider
			options={SCRIPT_PROVIDER_OPTIONS}
			deferLoading={${deferLoading}}
		>
			<LoadScriptButton />
			<PrintLoadingState />
			{/* add your paypal components here (ex: <PayPalButtons />) */}
		</PayPalScriptProvider>
	);
}`;
