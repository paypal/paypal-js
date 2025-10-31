import { beforeEach, describe, expect, test, vi } from "vitest";

import { loadCoreSdkScript } from "./index";
import { insertScriptElement, type ScriptElement } from "../utils";

vi.mock("../utils", async () => {
    const actual = await vi.importActual<typeof import("../utils")>("../utils");
    return {
        ...actual,
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

describe("loadCoreSdkScript()", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        vi.clearAllMocks();
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
});
