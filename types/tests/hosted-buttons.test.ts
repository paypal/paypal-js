import { loadScript } from "../../src/index";
import type { PayPalNamespace } from "../index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function main() {
    let paypal: PayPalNamespace | null;

    try {
        paypal = await loadScript({
            clientId: "test",
            components: "buttons",
        });
    } catch (err) {
        throw new Error(`Failed to load the paypal sdk script: ${err}`);
    }

    if (!paypal?.HostedButtons) {
        throw new Error("Invalid paypal object for buttons component");
    }

    paypal.HostedButtons().render("#container");
    paypal.HostedButtons().render(document.createElement("div"));
    paypal
        .HostedButtons({
            hostedButtonId: "B123456789",
        })
        .render("#container");
}
