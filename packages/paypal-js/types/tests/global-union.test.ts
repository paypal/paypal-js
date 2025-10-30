import type { PayPalNamespace } from "../index";
import type { PayPalV6Namespace } from "../v6/index";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testGlobalUnionType() {
    const mockV5: PayPalNamespace = {
        version: "5.0.0",
        Buttons: () => ({}) as any,
        Marks: () => ({}) as any,
        Messages: () => ({}) as any,
        HostedFields: {} as any,
        CardFields: () => ({}) as any,
    };

    const mockV6: PayPalV6Namespace = {
        createInstance: async () => ({}) as any,
    };

    // test compile-time type checking for assignment compatibility
    let testPaypal: typeof window.paypal;
    testPaypal = mockV5;
    testPaypal = mockV6;
    testPaypal = null;
    testPaypal = undefined;

    // cannot access properties directly without type guards
    if (window.paypal) {
        // @ts-expect-error - property 'Buttons' does not exist on type 'PayPalNamespace | PayPalV6Namespace'
        window.paypal.Buttons();

        // @ts-expect-error - property 'createInstance' does not exist on type 'PayPalNamespace | PayPalV6Namespace'
        window.paypal.createInstance();

        // @ts-expect-error - property 'version' does not exist on type 'PayPalNamespace | PayPalV6Namespace'
        console.log(window.paypal.version);
    }

    // test inline type checking
    if (window.paypal && "createInstance" in window.paypal) {
        const v6Instance = window.paypal;
        v6Instance.createInstance({
            clientToken: "test",
            components: ["paypal-payments"],
        });

        // @ts-expect-error - Property 'Buttons' does not exist on type 'PayPalV6Namespace'
        v6Instance.Buttons();
    }

    if (window.paypal && "Buttons" in window.paypal) {
        const v5Instance = window.paypal;
        v5Instance.Buttons?.({ createOrder: () => Promise.resolve("test") });
        console.log(v5Instance.version);

        // @ts-expect-error - Property 'createInstance' does not exist on type 'PayPalNamespace'
        v5Instance.createInstance();
    }

    // test custom type guard functions (alternative to inline type checking)
    function isPayPalV6(
        paypal: NonNullable<typeof window.paypal>,
    ): paypal is PayPalV6Namespace {
        return "createInstance" in paypal;
    }

    function isPayPalV5(
        paypal: NonNullable<typeof window.paypal>,
    ): paypal is PayPalNamespace {
        return "Buttons" in paypal;
    }

    if (window.paypal) {
        if (isPayPalV6(window.paypal)) {
            window.paypal.createInstance({
                clientToken: "test",
                components: ["paypal-payments"],
            });
        } else if (isPayPalV5(window.paypal)) {
            window.paypal.Buttons?.({
                createOrder: () => Promise.resolve("test"),
            });
        }
    }
}
