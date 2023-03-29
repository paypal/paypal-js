import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { loadScript, loadCustomScript } from "./load-script";
// import using "*" to spy on insertScriptElement()
import * as utils from "./utils";

describe("loadScript()", () => {
    const insertScriptElementSpy = vi.spyOn(utils, "insertScriptElement");

    const paypalNamespace = { version: "5" };

    beforeEach(() => {
        document.head.innerHTML = "";

        insertScriptElementSpy.mockImplementation(
            ({ onSuccess, attributes = {} }: utils.ScriptElement) => {
                const namespace = attributes["data-namespace"] || "paypal";

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (window as any)[namespace] = paypalNamespace;

                process.nextTick(() => onSuccess());
            }
        );

        Object.defineProperty(window, "paypal", {
            writable: true,
            value: undefined,
        });
    });

    afterEach(() => {
        insertScriptElementSpy.mockClear();
    });

    test("should insert <script> and resolve the promise", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({ clientId: "test" });
        expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
        expect(response).toEqual(window.paypal);
    });

    test("should not insert <script> when an existing script with the same params is already in the DOM", async () => {
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        document.head.innerHTML =
            '<script src="https://www.paypal.com/sdk/js?client-id=test"></script>';
        window.paypal = paypalNamespace;

        const response = await loadScript({ clientId: "test" });
        expect(insertScriptElementSpy).not.toHaveBeenCalled();
        expect(response).toEqual(window.paypal);
    });

    test("should support loading multiple scripts using different namespaces", async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const windowObject = window as any;
        expect(windowObject.paypal1).toBe(undefined);
        expect(windowObject.paypal2).toBe(undefined);

        const response = await Promise.all([
            loadScript({ clientId: "test", dataNamespace: "paypal1" }),
            loadScript({ clientId: "test", dataNamespace: "paypal2" }),
        ]);

        expect(insertScriptElementSpy).toHaveBeenCalledTimes(2);
        expect(response).toEqual([windowObject.paypal1, windowObject.paypal2]);
    });

    test("should reject the promise when window.paypal is undefined after loading the <script>", async () => {
        expect.assertions(3);

        insertScriptElementSpy.mockImplementation(({ onSuccess }) => {
            // do not set window.paypal in the mock implementation
            process.nextTick(() => onSuccess());
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ clientId: "test" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message: errorMessage } = err as Record<string, string>;

            expect(errorMessage).toBe(
                "The window.paypal global variable is not available."
            );
        }
    });

    test("should throw an error from invalid arguments", () => {
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript()).toThrow("Expected an options object.");
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript({}, {})).toThrow(
            "Expected PromisePonyfill to be a function."
        );
    });
});

describe("loadCustomScript()", () => {
    const insertScriptElementSpy = vi.spyOn(utils, "insertScriptElement");

    beforeEach(() => {
        document.head.innerHTML = "";

        insertScriptElementSpy.mockImplementation(
            ({ onSuccess }: utils.ScriptElement) => {
                process.nextTick(() => onSuccess());
            }
        );
    });

    afterEach(() => {
        insertScriptElementSpy.mockClear();
    });

    test("should insert <script> and resolve the promise", async () => {
        const options = {
            url: "https://www.example.com/index.js",
            attributes: { id: "test-id-value" },
        };

        await loadCustomScript(options);
        expect(insertScriptElementSpy).toHaveBeenCalledWith(
            expect.objectContaining(options)
        );
    });

    test("should throw an error from invalid arguments", () => {
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadCustomScript()).toThrow("Expected an options object.");
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadCustomScript({ url: null })).toThrow("Invalid url.");
        expect(() => loadCustomScript({ url: "" })).toThrow("Invalid url.");

        expect(() =>
            loadCustomScript({
                url: "https://www.example.com/index.js",
                // @ts-expect-error ignore invalid arguments error
                attributes: "",
            })
        ).toThrow("Expected attributes to be an object.");
        expect(() =>
            loadCustomScript(
                {
                    url: "https://www.example.com/index.js",
                },
                // @ts-expect-error ignore invalid arguments error
                {}
            )
        ).toThrow("Expected PromisePonyfill to be a function.");
    });

    test("should throw an error when the script fails to load", async () => {
        expect.assertions(2);

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(
                'The script "https://www.example.com/index.js" failed to load.'
            );
        }
    });

    test("should throw the default error when the script fails to load but getting the error has a success response", async () => {
        expect.assertions(2);
        window.fetch = vi.fn().mockResolvedValue({
            status: 200,
        });

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(
                'The script "https://www.example.com/index.js" failed to load.'
            );
        }
    });

    test("should throw an error when the script fails to load taking the response message", async () => {
        const errorMessage =
            "Expected client-id to be passed (debug id: f124435555fb3)";
        const serverMessage = `
        throw new Error("SDK Validation error: 'Expected client-id to be passed'");

        /* Original Error:

        ${errorMessage}

        */`;
        window.fetch = vi.fn().mockResolvedValue({
            status: 400,
            text: vi.fn().mockResolvedValue(serverMessage),
        });

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(errorMessage);
        }
    });

    test("should throw an error when the script fails to load because invalid client-id", async () => {
        const errorMessage =
            "client-id not recognized for either production or sandbox: djhhjfg (debug id: ab31131130723)";
        const serverMessage = `throw new Error("SDK Validation error: 'client-id not recognized for either production or sandbox: djhhjfg'");

        /* Original Error:

        ${errorMessage}

        */`;
        window.fetch = vi.fn().mockResolvedValue({
            status: 400,
            text: vi.fn().mockResolvedValue(serverMessage),
        });

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(errorMessage);
        }
    });

    test("should throw an error when the script fails to load and server response is a plain string", async () => {
        const errorMessage =
            "This is a custom error message: djhhjfg (debug id: ab31131130723)";
        const serverMessage = `Random text here we do not process it: 'This text is ignore'";

        /* Original Error:

        ${errorMessage}

        */`;
        window.fetch = vi.fn().mockResolvedValue({
            status: 400,
            text: vi.fn().mockResolvedValue(serverMessage),
        });

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(errorMessage);
        }
    });

    test("should throw an error when the script fails to load and fail fetching the error message", async () => {
        window.fetch = vi.fn().mockResolvedValue({
            status: 500,
            text: vi.fn().mockResolvedValue("Internal Server Error"),
        });

        insertScriptElementSpy.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(insertScriptElementSpy).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe("Internal Server Error");
        }
    });

    test("should use the provided promise ponyfill", () => {
        const PromisePonyfill = vi.fn(() => {
            return {
                then: vi.fn(),
            };
        });
        loadCustomScript(
            {
                url: "https://www.example.com/index.js",
            },
            // @ts-expect-error ignore mock error
            PromisePonyfill
        );
        expect(PromisePonyfill).toHaveBeenCalledTimes(1);
    });
});
