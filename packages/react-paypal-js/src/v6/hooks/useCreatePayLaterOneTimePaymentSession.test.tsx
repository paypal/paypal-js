import { usePayLaterOneTimePaymentSession } from "./useCreatePayLaterOneTimePaymentSession";

describe("usePayLaterOneTimePaymentSession", () => {
    it("should provide a click handler that calls session start", () => {
        const { handleClick } = usePayLaterOneTimePaymentSession({
            presentationMode,
            createOrder,
            orderId,
            onApprove,
            onCancel,
            onError,
        });

        // TODO implement
        throw new Error("implement");
    });

    it("should error if there is no sdkInstance when called", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should provide a cancel handler that cancels the session", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should error if the click handler is called and there is no sdkInstance", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should provide a destroy handler that destroys the session", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should not re-run if callbacks are updated", () => {
        // TODO implement
        throw new Error("implement");
    });

    it("should destroy the session when the parent component is unmounted", () => {
        // TODO implement
        throw new Error("implement");
    });
});
