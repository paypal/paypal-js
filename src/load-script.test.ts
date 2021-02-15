jest.mock("./utils", () => {
    return {
        findScript: jest.fn(),
        insertScriptElement: jest.fn(),
        processOptions: jest.fn(),
    };
});

import loadScript from "./load-script";
import { findScript, insertScriptElement, processOptions } from "./utils";

describe("loadScript()", () => {
    const PromiseBackup = window.Promise;
    const paypalNamespace = { version: "5" };

    const mockedInsertScriptElement = <jest.Mock<void>>insertScriptElement;
    const mockedProcessOptions = <
        jest.Mock<{ url: string; dataAttributes: Record<string, unknown> }>
    >processOptions;
    const mockedFindScript = <jest.Mock<HTMLScriptElement | null>>findScript;

    beforeEach(() => {
        document.head.innerHTML = "";

        mockedFindScript.mockReturnValue(null);

        mockedInsertScriptElement.mockImplementation(({ onSuccess }) => {
            window.paypal = paypalNamespace;
            process.nextTick(() => onSuccess());
        });

        mockedProcessOptions.mockReturnValue({
            url: "https://www.paypal.com/sdk/js?client-id=test",
            dataAttributes: {},
        });

        Object.defineProperty(window, "paypal", {
            writable: true,
            value: undefined,
        });

        window.Promise = PromiseBackup;
    });

    afterEach(() => {
        mockedFindScript.mockClear();
        mockedInsertScriptElement.mockClear();
        mockedProcessOptions.mockClear();
    });

    test("should insert <script> and resolve the promise", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({ "client-id": "test" });
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
        expect(response).toEqual(window.paypal);
    });

    test("should not insert <script> when an existing script with the same src is already in the DOM and window.paypal is set", async () => {
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        mockedFindScript.mockReturnValue(document.createElement("script"));
        window.paypal = paypalNamespace;

        const response = await loadScript({ "client-id": "test" });
        expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        expect(response).toEqual(window.paypal);
    });

    test("should only load the <script> once when loadScript() is called twice", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await Promise.all([
            loadScript({ "client-id": "test" }),
            loadScript({ "client-id": "test" }),
        ]);

        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
        expect(response).toEqual([window.paypal, window.paypal]);
    });

    test("should reject the promise when window.paypal is undefined after loading the <script>", async () => {
        expect.assertions(3);

        mockedInsertScriptElement.mockImplementation(({ onSuccess }) => {
            // do not set window.paypal in the mock implementation
            process.nextTick(() => onSuccess());
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ "client-id": "test" });
        } catch (err) {
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
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

        mockedInsertScriptElement.mockImplementationOnce(({ onError }) => {
            process.nextTick(() => onError());
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ "client-id": "test" });
        } catch (err) {
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
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
