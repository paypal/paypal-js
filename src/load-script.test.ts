import loadScript from "./load-script";
// import using "*" so we can spy on insertScriptElement()
import * as utils from "./utils";

describe("loadScript()", () => {
    const insertScriptElementSpy = jest.spyOn(utils, "insertScriptElement");
    const PromiseBackup = window.Promise;
    const paypalNamespace = { version: "5" };

    beforeEach(() => {
        document.head.innerHTML = "";

        insertScriptElementSpy.mockImplementation(
            ({ onSuccess, dataAttributes = {} }: utils.ScriptElement) => {
                const namespace = dataAttributes["data-namespace"] || "paypal";
                window[namespace] = paypalNamespace;

                process.nextTick(() => onSuccess());
            }
        );

        Object.defineProperty(window, "paypal", {
            writable: true,
            value: undefined,
        });

        window.Promise = PromiseBackup;
    });

    afterEach(() => {
        insertScriptElementSpy.mockClear();
    });

    test("should insert <script> and resolve the promise", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({ "client-id": "test" });
        expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
        expect(response).toEqual(window.paypal);
    });

    test("should not insert <script> when an existing script with the same params is already in the DOM", async () => {
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        document.head.innerHTML =
            '<script src="https://www.paypal.com/sdk/js?client-id=test"></script>';
        window.paypal = paypalNamespace;

        const response = await loadScript({ "client-id": "test" });
        expect(insertScriptElementSpy).not.toHaveBeenCalled();
        expect(response).toEqual(window.paypal);
    });

    test("should support loading multiple scripts using different namespaces", async () => {
        expect(window.paypal1).toBe(undefined);
        expect(window.paypal2).toBe(undefined);

        const response = await Promise.all([
            loadScript({ "client-id": "test", "data-namespace": "paypal1" }),
            loadScript({ "client-id": "test", "data-namespace": "paypal2" }),
        ]);

        expect(insertScriptElementSpy).toHaveBeenCalledTimes(2);
        expect(response).toEqual([window.paypal1, window.paypal2]);
    });

    test("should reject the promise when window.paypal is undefined after loading the <script>", async () => {
        expect.assertions(3);

        insertScriptElementSpy.mockImplementation(({ onSuccess }) => {
            // do not set window.paypal in the mock implementation
            process.nextTick(() => onSuccess());
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ "client-id": "test" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            expect(err.message).toBe(
                "The window.paypal global variable is not available."
            );
        }
    });

    test("should throw an error from invalid arguments", () => {
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript()).toThrow(
            "Invalid arguments. Expected an object to be passed into loadScript()."
        );
    });

    test("should throw an error when the script fails to load", async () => {
        expect.assertions(3);

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ "client-id": "test" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            expect(err.message).toBe(
                'The script "https://www.paypal.com/sdk/js?client-id=test" didn\'t load correctly.'
            );
        }
    });

    test("should use the provided promise ponyfill", () => {
        const PromisePonyfill = jest.fn();
        // @ts-expect-error ignore mock error
        loadScript({ "client-id": "test" }, PromisePonyfill);
        expect(PromisePonyfill).toHaveBeenCalledTimes(1);
    });

    test("should throw an error when the Promise implementation is undefined", () => {
        // @ts-expect-error ignore deleting window.Promise
        delete window.Promise;

        expect(window.paypal).toBe(undefined);
        expect(window.Promise).toBe(undefined);
        expect(() => loadScript({ "client-id": "test" })).toThrow(
            "Failed to load the PayPal JS SDK script because Promise is undefined. To resolve the issue, use a Promise polyfill."
        );
    });
});
