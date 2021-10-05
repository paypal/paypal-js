import { decorateActions } from "./utils";

import { mock } from "jest-mock-extended";
import { BraintreePayPalCheckout } from "../../types/braintree/paypalCheckout";
import {
    CreateOrderActions,
    OnApproveData,
    OnApproveActions,
} from "@paypal/paypal-js/types/components/buttons";

describe("decorateActions", () => {
    test("shouldn't modify the button props", () => {
        const buttonProps = {
            disabled: false,
            children: null,
            onClick: jest.fn(),
            onInit: jest.fn(),
        };

        const mockedCheckout = mock<BraintreePayPalCheckout>();

        decorateActions(buttonProps, mockedCheckout);

        expect(buttonProps).toMatchInlineSnapshot(
            buttonProps,
            `
            Object {
              "children": null,
              "disabled": false,
              "onClick": [MockFunction],
              "onInit": [MockFunction],
            }
        `
        );
    });

    test("should modify the createOrder", () => {
        const buttonPropsWithCreateOrder = {
            disabled: false,
            children: null,
            onClick: jest.fn(),
            onInit: jest.fn(),
            createOrder: jest
                .fn()
                .mockImplementation(
                    (data, actions) => actions.braintree.create !== undefined
                ),
        };

        const mockedCheckout = mock<BraintreePayPalCheckout>();

        const buttonProps = decorateActions(
            buttonPropsWithCreateOrder,
            mockedCheckout
        );

        if (!buttonProps) {
            throw new Error("buttonProps is undefined");
        } else if (!buttonProps.createOrder) {
            throw new Error("buttonProps.createOrder is undefined");
        }

        const mockedCreateOrderActions = mock<CreateOrderActions>();

        expect(
            buttonProps.createOrder({}, mockedCreateOrderActions)
        ).toBeTruthy();
    });

    test("should modify the onApprove", () => {
        const buttonPropsWithOnApprove = {
            disabled: false,
            children: null,
            onClick: jest.fn(),
            onInit: jest.fn(),
            onApprove: jest
                .fn()
                .mockImplementation(
                    (data, actions) => actions.braintree.create !== undefined
                ),
        };

        const mockedCheckout = mock<BraintreePayPalCheckout>();

        const buttonProps = decorateActions(
            buttonPropsWithOnApprove,
            mockedCheckout
        );

        if (!buttonProps) {
            throw new Error("buttonProps is undefined");
        } else if (!buttonProps.onApprove) {
            throw new Error("buttonProps.onApprove is undefined");
        }

        const mockedOnApproveData = mock<OnApproveData>();
        const mockedOnApproveActions = mock<OnApproveActions>();
        expect(
            buttonProps.onApprove(mockedOnApproveData, mockedOnApproveActions)
        ).toBeTruthy();
    });
});
