import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.useFakeTimers();

import {
    findScript,
    insertScriptElement,
    objectToQueryString,
    processOptions,
} from "./utils";

describe("objectToQueryString()", () => {
    test("coverts an object to a query string", () => {
        const params = {
            "client-id": "test",
            currency: "USD",
        };

        expect(objectToQueryString(params)).toBe("client-id=test&currency=USD");
    });
});

describe("processOptions()", () => {
    test("returns dataAttributes and url", () => {
        const options = {
            clientId: "test",
            currency: "USD",
            dataPageType: "checkout",
            someRandomKey: "some-random-value",
        };

        const { url, dataAttributes } = processOptions(options);

        expect(url).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&currency=USD&some-random-key=some-random-value",
        );
        expect(dataAttributes).toEqual({ "data-page-type": "checkout" });
    });

    test("sets a custom base url", () => {
        const { url } = processOptions({
            clientId: "test",
            sdkBaseUrl: "http://localhost.paypal.com:8000/sdk/js",
        });

        expect(url).toBe(
            "http://localhost.paypal.com:8000/sdk/js?client-id=test",
        );
    });

    test("default values when only client-id is passed in", () => {
        const { url, dataAttributes } = processOptions({ clientId: "test" });

        expect(url).toBe("https://www.paypal.com/sdk/js?client-id=test");
        expect(dataAttributes).toEqual({});
    });

    test("support passing arrays for query string params", () => {
        const { url, dataAttributes } = processOptions({
            clientId: "test",
            components: ["buttons", "marks", "messages"],
            enableFunding: ["venmo", "paylater"],
            disableFunding: ["card"],
        });

        expect(url).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&components=buttons,marks,messages&enable-funding=venmo,paylater&disable-funding=card",
        );
        expect(dataAttributes).toEqual({});
    });

    test("supports passing an array of merchant ids", () => {
        const { url, dataAttributes } = processOptions({
            clientId: "test",
            merchantId: ["123", "456", "789"],
        });

        expect(url).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&merchant-id=*",
        );
        expect(dataAttributes).toEqual({ "data-merchant-id": "123,456,789" });
    });

    test("supports passing a single merchant id", () => {
        const { url, dataAttributes } = processOptions({
            clientId: "test",
            merchantId: "123",
        });

        expect(url).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&merchant-id=123",
        );
        expect(dataAttributes).toEqual({});

        const { url: url2, dataAttributes: dataAttributes2 } = processOptions({
            clientId: "test",
            merchantId: ["123"],
        });

        expect(url2).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&merchant-id=123",
        );
        expect(dataAttributes2).toEqual({});
    });

    test("supports passing options in kebab-case or camelCase format", () => {
        const { url, dataAttributes } = processOptions({
            // @ts-expect-error ignore invalid arguments error
            "client-id": "test",
            "merchant-id": ["123", "456", "789"],
        });

        expect(url).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&merchant-id=*",
        );
        expect(dataAttributes).toEqual({ "data-merchant-id": "123,456,789" });

        const { url: url2, dataAttributes: dataAttributes2 } = processOptions({
            clientId: "test",
            merchantId: ["123", "456", "789"],
        });

        expect(url2).toBe(
            "https://www.paypal.com/sdk/js?client-id=test&merchant-id=*",
        );
        expect(dataAttributes2).toEqual({ "data-merchant-id": "123,456,789" });
    });
});

describe("findScript()", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
    });

    test("finds the existing script in the DOM", () => {
        const url = "https://www.paypal.com/sdk/js?client-id=test";
        document.head.innerHTML = `<script src="${url}" data-client-token="123" data-page-type="checkout" data-uid-auto="81376a99ff_mdm6mji6mzg"></script>`;

        const result = findScript(url, {
            "data-page-type": "checkout",
            "data-client-token": "123",
        });
        if (!result) throw new Error("Expected to find <script> element");

        expect(result.src).toBe(url);
    });

    test("returns null when the script is not found", () => {
        expect(
            findScript("https://www.paypal.com/sdk/js?client-id=test"),
        ).toBeNull();
    });

    test("returns null when the script is found but the number of data attributes do not match", () => {
        const url = "https://www.paypal.com/sdk/js?client-id=test";
        document.head.innerHTML = `<script src="${url}" data-client-token="12345" data-page-type="home"></script>`;

        const result = findScript(url, { "data-client-token": "12345" });
        expect(result).toBeNull();
    });

    test("returns null when the script is found but the data attribute values do not match", () => {
        const url = "https://www.paypal.com/sdk/js?client-id=test";
        document.head.innerHTML = `<script src="${url}" data-page-type="home"></script>`;

        const result = findScript(url, { "data-page-type": "checkout" });
        expect(result).toBeNull();
    });
});

describe("insertScriptElement()", () => {
    const url = "https://www.paypal.com/sdk/js?client-id=test";

    beforeEach(() => {
        document.head.innerHTML = "";
    });

    test("inserts a <script> with attributes into the DOM", () => {
        insertScriptElement({
            url,
            attributes: { "data-client-token": "12345" },
            onError: vi.fn(),
            onSuccess: vi.fn(),
        });

        const scriptFromDOM =
            document.querySelector<HTMLScriptElement>("head script");

        if (!scriptFromDOM) {
            throw new Error("Expected to find <script> element");
        }

        expect(scriptFromDOM.src).toBe(url);
        expect(scriptFromDOM.getAttribute("data-client-token")).toBe("12345");
    });

    test("sets a nonce on the script tag when data-csp-nonce is used", () => {
        insertScriptElement({
            url,
            attributes: { "data-csp-nonce": "12345" },
            onError: vi.fn(),
            onSuccess: vi.fn(),
        });

        const scriptFromDOM =
            document.querySelector<HTMLScriptElement>("head script");
        if (!scriptFromDOM)
            throw new Error("Expected to find <script> element");

        expect(scriptFromDOM.getAttribute("data-csp-nonce")).toBe("12345");
        expect(scriptFromDOM.getAttribute("nonce")).toBe("12345");
    });

    test("prepends a <script> to the top of the <head> before any other scripts", () => {
        // simulate having the JS SDK already loaded with currency=USD
        const existingScript = document.createElement("script");
        existingScript.src = `${url}&currency=USD`;
        document.head.appendChild(existingScript);

        // load the JS SDK with currency=EUR
        const newScriptSrc = `${url}&currency=EUR`;
        insertScriptElement({
            url: newScriptSrc,
            onError: vi.fn(),
            onSuccess: vi.fn(),
        });

        const [firstScript, secondScript] = Array.from(
            document.querySelectorAll<HTMLScriptElement>("head script"),
        );

        expect(firstScript.src).toBe(newScriptSrc);
        expect(secondScript.src).toBe(existingScript.src);
    });

    describe("callbacks", () => {
        const loadFailureSrcKey = "http://localhost/error";

        beforeEach(() => {
            const insertBeforeSpy = vi.spyOn(document.head, "insertBefore");
            interface MockHTMLScriptElement extends Node {
                src: string;
                onerror: () => void;
                onload: () => void;
            }
            insertBeforeSpy.mockImplementation((domNode) => {
                const newScript = <MockHTMLScriptElement>domNode;
                if (newScript.src === loadFailureSrcKey) {
                    setTimeout(() => newScript.onerror());
                } else if (newScript.onload) {
                    setTimeout(() => newScript.onload());
                }
                return newScript;
            });
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        test("onload() event", () => {
            expect.assertions(1);
            const onloadMock = vi.fn();

            const url = "https://www.paypal.com/sdk/js";
            insertScriptElement({
                url,
                onError: vi.fn(),
                onSuccess: onloadMock,
            });

            vi.runAllTimers();
            expect(onloadMock).toBeCalled();
        });

        test("onerror() event", () => {
            expect.assertions(1);
            const onErrorMock = vi.fn();
            const url = loadFailureSrcKey;

            insertScriptElement({
                url,
                onError: onErrorMock,
                onSuccess: vi.fn(),
            });

            vi.runAllTimers();
            expect(onErrorMock).toBeCalled();
        });
    });
});
