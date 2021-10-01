import {
    getPayPalWindowNamespace,
    getBraintreeWindowNamespace,
    hashStr,
} from "./utils";
import { DATA_NAMESPACE } from "./constants";

describe("getPayPalWindowNamespace", () => {
    beforeAll(() => {
        window.paypal = {
            Buttons: jest.fn(),
        };
    });

    test("should return the paypal namespace", () => {
        expect(getPayPalWindowNamespace("paypal")).toEqual(window.paypal);
    });

    test("should not found the namespace", () => {
        expect(getPayPalWindowNamespace("testNamespace")).toBeUndefined();
    });
});

describe("getBraintreeWindowNamespace", () => {
    beforeAll(() => {
        window.braintree = {
            createPayment: jest.fn(),
            client: jest.fn(),
        };
    });

    test("should return the paypal namespace", () => {
        expect(getBraintreeWindowNamespace("braintree")).toEqual(
            window.braintree
        );
    });

    test("should not found the namespace", () => {
        expect(getBraintreeWindowNamespace("testNamespace")).toBeUndefined();
    });
});

describe("hashStr", () => {
    test("should match the hash from the argument string", () => {
        expect(hashStr("react")).toMatchInlineSnapshot(`"xxhjw"`);
        expect(hashStr("react-js.braintree")).toMatchInlineSnapshot(
            `"xxhjbzppoallaomelb"`
        );
        expect(hashStr("react-js.paypal")).toMatchInlineSnapshot(
            `"xxhjbzppiqfhtje"`
        );
        expect(hashStr("")).toMatchInlineSnapshot(`""`);
        expect(
            hashStr(
                JSON.stringify({
                    "client-id":
                        "AfmdXiQAZD1rldTeFe9RNvsz8eBBG-Mltqh6h-iocQ1GUNuXIDnCie9tHcueD_NrMWB9dTlWl34xEK7V",
                    currency: "USD",
                    intent: "authorize",
                    debug: false,
                    vault: false,
                    locale: "US",
                    [DATA_NAMESPACE]: "braintree",
                })
            )
        ).toMatchInlineSnapshot(
            `"iiuovjsqddgseaaouopvvtcqciewjblfycugmepzoirvygvhquvfthtdttqasyqcdzbzaepjvxhbwsrjhhcurjzroipxqyishjiubldxsiumrlgiscmehhggkwzxusrrdpdxisuuektdeudjrtosskdpcksyhttbqsqsvdsoaugkffisgkusjvhthnqmlzgqccmutvqaztoqu"`
        );
    });
});
