import React from "react";
import { render, waitFor } from "@testing-library/react";
import { loadScript, loadCustomScript } from "@paypal/paypal-js";

import { BraintreePayPalButtons } from "./BraintreePayPalButtons";
import { PayPalScriptProvider } from "../PayPalScriptProvider";
import {
    EMPTY_PROVIDER_CONTEXT_CLIENT_TOKEN_ERROR_MESSAGE,
    BRAINTREE_SOURCE,
    BRAINTREE_PAYPAL_CHECKOUT_SOURCE,
} from "../../constants";
import { FUNDING } from "@paypal/sdk-constants";

jest.mock("@paypal/paypal-js", () => ({
    loadScript: jest.fn(),
    loadCustomScript: jest.fn(),
}));

const CLIENT_TOKEN =
    "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNklqSXdNVGd3TkRJMk1UWXRjMkZ1WkdKdmVDSXNJbWx6Y3lJNkltaDBkSEJ6T2k4dllYQnBMbk5oYm1SaWIzZ3VZbkpoYVc1MGNtVmxaMkYwWlhkaGVTNWpiMjBpZlEuZXlKbGVIQWlPakUyTWpnek5UYzBOamdzSW1wMGFTSTZJakk0TkRSbE5qUmhMVEk0T0dVdE5HUTVZaTFpWm1JNUxXTmtOVE15TkRBNVpURTFNaUlzSW5OMVlpSTZJamRtYUdKdVpHSnRjVE16YzNKdFpIWWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzV6WVc1a1ltOTRMbUp5WVdsdWRISmxaV2RoZEdWM1lYa3VZMjl0SWl3aWJXVnlZMmhoYm5RaU9uc2ljSFZpYkdsalgybGtJam9pTjJab1ltNWtZbTF4TXpOemNtMWtkaUlzSW5abGNtbG1lVjlqWVhKa1gySjVYMlJsWm1GMWJIUWlPbVpoYkhObGZTd2ljbWxuYUhSeklqcGJJbTFoYm1GblpWOTJZWFZzZENKZExDSnpZMjl3WlNJNld5SkNjbUZwYm5SeVpXVTZWbUYxYkhRaVhTd2liM0IwYVc5dWN5STZlMzE5LnEtRVc3dE83Ymp2MjBWX1gxUGY1WkR3VFBKSUdBQ092eEt2RUR5clFWV3NXR19ZeFNhejEweXF0d2Z1ZWVUNGl1Z181S2ZXaFpjZ1JiMTB2dDF1WWJBIiwiY29uZmlnVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzLzdmaGJuZGJtcTMzc3JtZHYvY2xpZW50X2FwaS92MS9jb25maWd1cmF0aW9uIiwiZ3JhcGhRTCI6eyJ1cmwiOiJodHRwczovL3BheW1lbnRzLnNhbmRib3guYnJhaW50cmVlLWFwaS5jb20vZ3JhcGhxbCIsImRhdGUiOiIyMDE4LTA1LTA4IiwiZmVhdHVyZXMiOlsidG9rZW5pemVfY3JlZGl0X2NhcmRzIl19LCJjbGllbnRBcGlVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvN2ZoYm5kYm1xMzNzcm1kdi9jbGllbnRfYXBpIiwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwibWVyY2hhbnRJZCI6IjdmaGJuZGJtcTMzc3JtZHYiLCJhc3NldHNVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczovL2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsInZlbm1vIjoib2ZmIiwiY2hhbGxlbmdlcyI6W10sInRocmVlRFNlY3VyZUVuYWJsZWQiOmZhbHNlLCJhbmFseXRpY3MiOnsidXJsIjoiaHR0cHM6Ly9vcmlnaW4tYW5hbHl0aWNzLXNhbmQuc2FuZGJveC5icmFpbnRyZWUtYXBpLmNvbS83ZmhibmRibXEzM3NybWR2In0sInBheXBhbEVuYWJsZWQiOnRydWUsInBheXBhbCI6eyJiaWxsaW5nQWdyZWVtZW50c0VuYWJsZWQiOnRydWUsImVudmlyb25tZW50Tm9OZXR3b3JrIjpmYWxzZSwidW52ZXR0ZWRNZXJjaGFudCI6ZmFsc2UsImFsbG93SHR0cCI6dHJ1ZSwiZGlzcGxheU5hbWUiOiJUZXN0IFN0b3JlIiwiY2xpZW50SWQiOiJBZm1kWGlRQVpEMXJsZFRlRmU5Uk52c3o4ZUJCRy1NbHRxaDZoLWlvY1ExR1VOdVhJRG5DaWU5dEhjdWVEX05yTVdCOWRUbFdsMzR4RUs3ViIsInByaXZhY3lVcmwiOiJodHRwczovL2V4YW1wbGUuY29tIiwidXNlckFncmVlbWVudFVybCI6Imh0dHBzOi8vZXhhbXBsZS5jb20iLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJicmFpbnRyZWVDbGllbnRJZCI6Im1hc3RlcmNsaWVudDMiLCJtZXJjaGFudEFjY291bnRJZCI6IlVTRCIsImN1cnJlbmN5SXNvQ29kZSI6IlVTRCJ9fQ==";

const setup = () => {
    document.body.innerHTML = "";

    window.paypal = {
        Buttons: jest.fn(() => ({
            close: jest.fn().mockResolvedValue(),
            isEligible: jest.fn().mockReturnValue(true),
            render: jest.fn().mockResolvedValue({}),
        })),
    };
    window.braintree = {
        client: {
            create: jest.fn(),
        },
        paypalCheckout: {
            create: jest.fn().mockReturnValue({
                create: jest.fn(),
                tokenizePayment: jest.fn(),
                createPayment: jest.fn(),
            }),
        },
    };

    loadScript.mockResolvedValue(window.paypal);
    loadCustomScript.mockResolvedValue(window.braintree);
};

describe("Braintree PayPal button fail in mount process", () => {
    beforeEach(setup);

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should fail rendering the BraintreePayPalButton component not as a child of a PayPalScriptProvider component", () => {
        console.error = jest.fn();
        let errorMessage = "";

        try {
            render(<BraintreePayPalButtons />);
        } catch (ex) {
            errorMessage = ex.message;
        }
        expect(errorMessage).toEqual(
            "usePayPalScriptReducer must be used within a PayPalScriptProvider"
        );
        expect(console.error).toHaveBeenCalled();
    });

    test("should fail rendering the BraintreePayPalButton with empty component props", () => {
        console.error = jest.fn();
        let errorMessage = null;

        try {
            render(
                <PayPalScriptProvider>
                    <BraintreePayPalButtons />
                </PayPalScriptProvider>
            );
        } catch (ex) {
            errorMessage = ex.message;
        }
        expect(errorMessage).toEqual(
            "A client token wasn't found in the provider parent component"
        );
        expect(console.error).toHaveBeenCalled();
    });

    test("should fail rendering the BraintreePayPalButton component if the data-client-token is not set in the options", () => {
        console.error = jest.fn();
        let errorMessage = null;

        try {
            render(
                <PayPalScriptProvider options={{ "client-id": "test" }}>
                    <BraintreePayPalButtons />
                </PayPalScriptProvider>
            );
        } catch (ex) {
            errorMessage = ex.message;
        }
        expect(errorMessage).toEqual(
            EMPTY_PROVIDER_CONTEXT_CLIENT_TOKEN_ERROR_MESSAGE
        );
        expect(console.error).toHaveBeenCalled();
    });

    test("should fail rendering the BraintreePayPalButton component if the data-client-token is empty string", () => {
        let errorMessage = null;
        console.error = jest.fn();

        try {
            render(
                <PayPalScriptProvider options={{ "client-id": "test" }}>
                    <BraintreePayPalButtons />
                </PayPalScriptProvider>
            );
        } catch (ex) {
            errorMessage = ex.message;
        }

        expect(errorMessage).toEqual(
            EMPTY_PROVIDER_CONTEXT_CLIENT_TOKEN_ERROR_MESSAGE
        );
        expect(console.error).toHaveBeenCalled();
    });

    test("should fail rendering the BraintreePayPalButton component if cannot load braintree scripts", async () => {
        let errorMessage = null;
        console.error = jest.fn();

        try {
            loadCustomScript.mockImplementationOnce(() => {
                throw new Error("Network error");
            });

            render(
                <PayPalScriptProvider
                    options={{
                        "client-id": "test",
                        "data-client-token": CLIENT_TOKEN,
                    }}
                >
                    <BraintreePayPalButtons />
                </PayPalScriptProvider>
            );
        } catch (ex) {
            errorMessage = ex.message;
        }

        await waitFor(() => {
            expect(errorMessage).toEqual("Network error");
        });
        expect(console.error).toBeCalled();
    });
});

describe("render Braintree PayPal button component", () => {
    beforeEach(setup);

    test("should call loadCustomScripts from BraintreePayPalButton and loadScript from PayPalButtons", async () => {
        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    "data-client-token": CLIENT_TOKEN,
                }}
            >
                <BraintreePayPalButtons />
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(loadScript).toHaveBeenCalledWith(
                expect.objectContaining({
                    "client-id": "test",
                    "data-client-token": CLIENT_TOKEN,
                    "data-react-paypal-script-id": expect.any(String),
                })
            );
        });
        expect(loadCustomScript).toHaveBeenCalledWith(
            expect.objectContaining({ url: BRAINTREE_SOURCE })
        );
        expect(loadCustomScript).toHaveBeenLastCalledWith(
            expect.objectContaining({
                url: BRAINTREE_PAYPAL_CHECKOUT_SOURCE,
            })
        );
    });

    test("should call PayPalButtons with props", async () => {
        render(
            <PayPalScriptProvider
                options={{
                    "client-id": "test",
                    "data-client-token": CLIENT_TOKEN,
                }}
            >
                <BraintreePayPalButtons
                    style={{ layout: "horizontal" }}
                    fundingSource={FUNDING.CREDIT}
                    createOrder={() => null}
                    onApprove={() => null}
                />
            </PayPalScriptProvider>
        );

        await waitFor(() => {
            expect(window.paypal.Buttons).toBeCalledWith({
                style: { layout: "horizontal" },
                fundingSource: FUNDING.CREDIT,
                createOrder: expect.any(Function),
                onApprove: expect.any(Function),
                onInit: expect.any(Function),
            });
        });
    });
});
