import { loadScript } from "../../src/index";
import type { PayPalNamespace } from "../index";

// hosted-fields example
// https://developer.paypal.com/docs/checkout/advanced/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
    let paypal: PayPalNamespace | null;

    try {
        paypal = await loadScript({
            clientId: "test",
            components: "buttons,hosted-fields",
            dataClientToken: "123456789",
        });
    } catch (err) {
        throw new Error(`Failed to load the paypal sdk script: ${err}`);
    }

    if (!paypal?.HostedFields) {
        throw new Error("Invalid paypal object for hosted-fields component");
    }

    if (paypal.HostedFields.isEligible() === false) {
        throw new Error("The hosted-fields component is ineligible");
    }

    const cardFields = await paypal.HostedFields.render({
        createOrder: () => {
            // Call your server to create the order
            return Promise.resolve("7632736476738");
        },
        styles: {
            ".valid": {
                color: "green",
            },
            ".invalid": {
                color: "red",
            },
        },
        fields: {
            number: {
                selector: "#card-number",
                placeholder: "4111 1111 1111 1111",
            },
            cvv: {
                selector: "#cvv",
                placeholder: "123",
            },
            expirationDate: {
                selector: "#expiration-date",
                placeholder: "MM/YY",
            },
        },
    });

    cardFields.on("validityChange", (event) => {
        const field = event.fields[event.emittedBy];

        if (field.isValid) {
            console.log(event.emittedBy, "is fully valid");
        } else if (field.isPotentiallyValid) {
            console.log(event.emittedBy, "is potentially valid");
        } else {
            console.log(event.emittedBy, "is not valid");
        }
    });

    document
        .querySelector("#card-form")
        ?.addEventListener("submit", (event) => {
            const formFieldValues = Object.values(cardFields.getState().fields);
            const isFormValid = formFieldValues.every((field) => field.isValid);

            if (isFormValid === false) {
                return alert("The payment form is invalid");
            }

            event.preventDefault();
            cardFields.submit({});
        });
}
