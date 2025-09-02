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

    test("should default to using the production environment", async () => {
        await loadCoreSdkScript();
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.paypal.com/web-sdk/v6/core",
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
    });

    test("should support options for using sandbox environment and enabling debugging", async () => {
        await loadCoreSdkScript({ environment: "sandbox", debug: true });
        expect(mockedInsertScriptElement.mock.calls[0][0].url).toEqual(
            "https://www.sandbox.paypal.com/web-sdk/v6/core?debug=true",
        );
        expect(mockedInsertScriptElement).toHaveBeenCalledTimes(1);
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
