import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { loadScript, loadCustomScript } from "./load-script";
import { insertScriptElement, type ScriptElement } from "./utils";

vi.mock("./utils", async () => {
    const actual = await vi.importActual<typeof import("./utils")>("./utils");

    return {
        ...actual,
        // default mock for insertScriptElement
        insertScriptElement: vi
            .fn()
            .mockImplementation(
                ({ onSuccess, attributes = {} }: ScriptElement) => {
                    const namespace = attributes["data-namespace"] || "paypal";
                    vi.stubGlobal(namespace, { version: "5" });
                    process.nextTick(() => onSuccess());
                }
            ),
    };
});

const mockedInsertScriptElement = vi.mocked(insertScriptElement);

describe("loadScript()", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    test("should insert <script> and resolve the promise", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({ clientId: "test" });
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.paypal.com/sdk/js?client-id=test"
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
        expect(response).toEqual(window.paypal);
    });

    test("should insert <script> using environment option as sandbox", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({
            clientId: "test",
            environment: "sandbox",
        });
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.sandbox.paypal.com/sdk/js?client-id=test"
        );
        expect(response).toEqual(window.paypal);
    });

    test("should insert <script> using environment option as production", async () => {
        expect(window.paypal).toBe(undefined);

        const response = await loadScript({
            clientId: "test",
            environment: "production",
        });
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.paypal.com/sdk/js?client-id=test"
        );
        expect(response).toEqual(window.paypal);
    });

    test("should not insert <script> when an existing script with the same params is already in the DOM", async () => {
        expect(window.paypal).toBe(undefined);

        // simulate the script already being loaded
        document.head.innerHTML =
            '<script src="https://www.paypal.com/sdk/js?client-id=test" data-js-sdk-library="paypal-js"></script>';
        vi.stubGlobal("paypal", { version: "5" });

        const response = await loadScript({ clientId: "test" });
        expect(mockedInsertScriptElement).not.toHaveBeenCalled();
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

        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(2);
        expect(response).toEqual([windowObject.paypal1, windowObject.paypal2]);
    });

    test("should reject the promise when window.paypal is undefined after loading the <script>", async () => {
        expect.assertions(3);

        mockedInsertScriptElement.mockImplementation(({ onSuccess }) => {
            // do not set window.paypal in the mock implementation
            process.nextTick(() => onSuccess());
        });

        expect(window.paypal).toBe(undefined);

        try {
            await loadScript({ clientId: "test" });
        } catch (err) {
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
            const { message: errorMessage } = err as Record<string, string>;

            expect(errorMessage).toBe(
                "The window.paypal global variable is not available."
            );
        }
    });

    test("should fail to insert <script> using invalid environment option", async () => {
        expect(window.paypal).toBe(undefined);
        expect(() =>
            loadScript({
                clientId: "test",
                // @ts-expect-error intentionally sending invalid value
                environment: "invalid",
            })
        ).toThrowError(
            'The `environment` option must be either "production" or "sandbox"'
        );
    });

    test("should throw an error from invalid arguments", () => {
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript()).toThrow("Expected an options object.");
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript({}, {})).toThrow(
            "Expected PromisePonyfill to be a function."
        );

        const missingClientIdOptions = { components: "buttons" };
        // @ts-expect-error ignore invalid arguments error
        expect(() => loadScript(missingClientIdOptions)).toThrow(
            `Expected clientId in options object: ${JSON.stringify(
                missingClientIdOptions
            )}`
        );
    });
});

describe("loadCustomScript()", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.unstubAllGlobals();
    });

    test("should insert <script> and resolve the promise", async () => {
        const options = {
            url: "https://www.example.com/index.js",
            attributes: { id: "test-id-value" },
        };

        await loadCustomScript(options);
        expect(mockedInsertScriptElement).toHaveBeenCalledWith(
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

        // avoid the window.fetch() error lookup call to return the default error
        vi.stubGlobal("fetch", undefined);

        mockedInsertScriptElement.mockImplementation(({ onError }) => {
            process.nextTick(() => onError && onError("failed to load"));
        });

        try {
            await loadCustomScript({ url: "https://www.example.com/index.js" });
        } catch (err) {
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
            const { message } = err as Record<string, string>;

            expect(message).toBe(
                'The script "https://www.example.com/index.js" failed to load. Check the HTTP status code and response body in DevTools to learn more.'
            );
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
