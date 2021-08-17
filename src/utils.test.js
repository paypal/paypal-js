import { hashStr } from "./utils";

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
                    "data-namespace": "braintree",
                })
            )
        ).toMatchInlineSnapshot(
            `"iiuovjsqddgseaaouopvvtcqciewjblfycugmepzoirvygvhquvfthtdttqasyqcdzbzaepjvxhbwsrjhhcurjzroipxqyishjiubldxsiumrlgiscmehhggkwzxusrrdpdxisuuektdeudjrtosskdpcksyhttbqsqsvdsoaugkffisgkusjvhthnqmlzgqccmutvqaztoqu"`
        );
    });
});
