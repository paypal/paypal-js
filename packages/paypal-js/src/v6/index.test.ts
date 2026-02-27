import { beforeEach, describe, expect, test, vi } from "vitest";

import { loadCoreSdkScript } from "./index";
import { insertScriptElement, isServer, type ScriptElement } from "../utils";

vi.mock("../utils", async () => {
    const actual = await vi.importActual<typeof import("../utils")>("../utils");
    return {
        ...actual,
        isServer: vi.fn().mockReturnValue(false),
        // default mock for insertScriptElement
        insertScriptElement: vi
            .fn()
            .mockImplementation(({ onSuccess }: ScriptElement) => {
                vi.stubGlobal("paypal", { version: "6" });
                process.nextTick(() => onSuccess());
            }),
    };
});

const mockedInsertScriptElement = vi.mocked(insertScriptElement);
const mockedIsServer = vi.mocked(isServer);

/**
 * Inserts a fake V6 core script tag into the DOM to simulate
 * the "script already exists" branches.
 */
function insertFakeCoreScript(): HTMLScriptElement {
    const script = document.createElement("script");
    script.src = "https://www.sandbox.paypal.com/web-sdk/v6/core";
    document.head.appendChild(script);
    return script;
}

describe("loadCoreSdkScript()", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        vi.clearAllMocks();
        // Reset to default (non-server) for each test
        mockedIsServer.mockReturnValue(false);
        // Clean up any stubs on window.paypal
        vi.unstubAllGlobals();
    });

    test("should default to using the sandbox environment", async () => {
        await loadCoreSdkScript();
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.sandbox.paypal.com/web-sdk/v6/core",
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
    });

    test("should support options for using production environment", async () => {
        await loadCoreSdkScript({ environment: "production" });
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.paypal.com/web-sdk/v6/core",
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
    });

    test("should support enabling debugging", async () => {
        await loadCoreSdkScript({ debug: true });
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.sandbox.paypal.com/web-sdk/v6/core?debug=true",
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
    });

    describe("dataNamespace option", () => {
        test("should support custom data-namespace attribute", async () => {
            const customNamespace = "myCustomNamespace";

            // Update mock to set the custom namespace instead of window.paypal
            mockedInsertScriptElement.mockImplementationOnce(
                ({ onSuccess }: ScriptElement) => {
                    vi.stubGlobal(customNamespace, { version: "6" });
                    process.nextTick(() => onSuccess());
                },
            );

            const result = await loadCoreSdkScript({
                dataNamespace: customNamespace,
            });

            expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
                "https://www.sandbox.paypal.com/web-sdk/v6/core",
            );
            expect(
                mockedInsertScriptElement.mock.calls[0][0].attributes,
            ).toEqual({
                "data-namespace": customNamespace,
            });
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });

        test("should error when dataNamespace is an empty string", async () => {
            expect(async () => {
                await loadCoreSdkScript({ dataNamespace: "" });
            }).rejects.toThrowError(
                'The "dataNamespace" option cannot be an empty string',
            );
        });

        test("should error when dataNamespace is only whitespace", async () => {
            expect(async () => {
                await loadCoreSdkScript({ dataNamespace: "   " });
            }).rejects.toThrowError(
                'The "dataNamespace" option cannot be an empty string',
            );
        });
    });

    describe("dataSdkIntegrationSource option", () => {
        test("should support custom data-sdk-integration-source attribute", async () => {
            const integrationSource = "react-paypal-js";

            const result = await loadCoreSdkScript({
                dataSdkIntegrationSource: integrationSource,
            });

            expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
                "https://www.sandbox.paypal.com/web-sdk/v6/core",
            );
            expect(
                mockedInsertScriptElement.mock.calls[0][0].attributes,
            ).toEqual({
                "data-sdk-integration-source": integrationSource,
            });
            expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
            expect(result).toBeDefined();
        });

        test("should error when dataSdkIntegrationSource is an empty string", async () => {
            expect(async () => {
                await loadCoreSdkScript({ dataSdkIntegrationSource: "" });
            }).rejects.toThrowError(
                'The "dataSdkIntegrationSource" option cannot be an empty string',
            );
        });

        test("should error when dataSdkIntegrationSource is only whitespace", async () => {
            expect(async () => {
                await loadCoreSdkScript({ dataSdkIntegrationSource: "   " });
            }).rejects.toThrowError(
                'The "dataSdkIntegrationSource" option cannot be an empty string',
            );
        });
    });

    test("should return PayPal namespace with version property", async () => {
        const result = await loadCoreSdkScript();
        expect(result).toBeDefined();
        expect(result?.version).toBeDefined();
        expect(result?.version).toBe("6");
        expect(typeof result?.version).toBe("string");
    });

    test("should error due to unvalid input", async () => {
        expect(async () => {
            // @ts-expect-error invalid arguments
            await loadCoreSdkScript(123);
        }).rejects.toThrowError("Expected an options object");

        expect(async () => {
            // @ts-expect-error invalid arguments
            await loadCoreSdkScript({ environment: "bad_value" });
        }).rejects.toThrowError(
            'The "environment" option must be either "production" or "sandbox"',
        );
    });

    describe("server-side rendering", () => {
        test("should resolve with null in a server environment", async () => {
            mockedIsServer.mockReturnValue(true);
            const result = await loadCoreSdkScript();
            expect(result).toBeNull();
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });
    });

    describe("script already loaded", () => {
        test("should return cached namespace when script exists and window.paypal is available", async () => {
            insertFakeCoreScript();
            vi.stubGlobal("paypal", { version: "6.1.0" });

            const result = await loadCoreSdkScript();

            expect(result).toBeDefined();
            expect(result?.version).toBe("6.1.0");
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });

        test("should not return cached namespace when version does not start with 6", async () => {
            insertFakeCoreScript();
            vi.stubGlobal("paypal", { version: "5.0.0" });

            // Since version doesn't start with "6", it falls through to the
            // "script exists but not loaded" branch which waits for load/error
            const promise = loadCoreSdkScript();

            // Trigger the script's load event to resolve
            const script = document.querySelector<HTMLScriptElement>(
                'script[src*="/web-sdk/v6/core"]',
            )!;
            vi.stubGlobal("paypal", { version: "6.0.0" });
            script.dispatchEvent(new Event("load"));

            const result = await promise;
            expect(result?.version).toBe("6.0.0");
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });
    });

    describe("script exists but not yet loaded (e.g. React StrictMode)", () => {
        test("should resolve when the pending script fires its load event", async () => {
            const script = insertFakeCoreScript();

            const promise = loadCoreSdkScript();

            // Simulate the script finishing loading
            vi.stubGlobal("paypal", { version: "6.0.0" });
            script.dispatchEvent(new Event("load"));

            const result = await promise;
            expect(result).toBeDefined();
            expect(result?.version).toBe("6.0.0");
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });

        test("should resolve with custom namespace when dataNamespace is set", async () => {
            const script = insertFakeCoreScript();
            const customNamespace = "myPayPal";

            const promise = loadCoreSdkScript({
                dataNamespace: customNamespace,
            });

            // Simulate the script setting the custom namespace
            vi.stubGlobal(customNamespace, { version: "6.0.0" });
            script.dispatchEvent(new Event("load"));

            const result = await promise;
            expect(result).toBeDefined();
            expect(result?.version).toBe("6.0.0");
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });

        test("should reject when the pending script loads but namespace is missing", async () => {
            const script = insertFakeCoreScript();

            const promise = loadCoreSdkScript();

            // Fire load without setting window.paypal
            script.dispatchEvent(new Event("load"));

            await expect(promise).rejects.toEqual(
                "The window.paypal global variable is not available",
            );
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });

        test("should reject when the pending script fires an error event", async () => {
            const script = insertFakeCoreScript();

            const promise = loadCoreSdkScript();

            script.dispatchEvent(new Event("error"));

            await expect(promise).rejects.toThrow(
                `The script "https://www.sandbox.paypal.com/web-sdk/v6/core" failed to load. Check the HTTP status code and response body in DevTools to learn more.`,
            );
            expect(mockedInsertScriptElement).not.toHaveBeenCalled();
        });
    });

    describe("new script insertion", () => {
        test("should reject when namespace is not available after script loads", async () => {
            mockedInsertScriptElement.mockImplementationOnce(
                ({ onSuccess }: ScriptElement) => {
                    // Do NOT set window.paypal — simulate missing namespace
                    process.nextTick(() => onSuccess());
                },
            );

            await expect(loadCoreSdkScript()).rejects.toEqual(
                "The window.paypal global variable is not available",
            );
        });

        test("should reject when script fails to load", async () => {
            mockedInsertScriptElement.mockImplementationOnce(
                ({ onError }: ScriptElement) => {
                    process.nextTick(() => {
                        if (onError) onError(new Event("error") as ErrorEvent);
                    });
                },
            );

            await expect(loadCoreSdkScript()).rejects.toThrow("failed to load");
        });
    });
});
