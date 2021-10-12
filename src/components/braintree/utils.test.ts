import { decorateActions } from "./utils";

import { mock } from "jest-mock-extended";
import { BraintreePayPalCheckout } from "../../types/braintree/paypalCheckout";
import { CreateBillingAgreementActions } from "../..";
import type {
    CreateOrderBraintreeActions,
    OnApproveBraintreeActions,
    OnApproveBraintreeData,
} from "../../types/braintreePayPalButtonTypes";

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

        const mockedCreateOrderActions = mock<CreateOrderBraintreeActions>();

        expect(
            buttonProps.createOrder({}, mockedCreateOrderActions)
        ).toBeTruthy();
    });

    test("should decorate the createBillingAgreement callback", () => {
        const buttonPropsWithCreateBillingAgreement = {
            disabled: false,
            children: null,
            onClick: jest.fn(),
            onInit: jest.fn(),
            createBillingAgreement: jest
                .fn()
                .mockImplementation(
                    (data, actions) =>
                        actions.braintree.createBillingAgreement !== undefined
                ),
        };

        const mockedCheckout = mock<BraintreePayPalCheckout>();

        const buttonProps = decorateActions(
            buttonPropsWithCreateBillingAgreement,
            mockedCheckout
        );

        if (!buttonProps) {
            throw new Error("buttonProps is undefined");
        } else if (!buttonProps.createBillingAgreement) {
            throw new Error("buttonProps.createOrder is undefined");
        }

        const mockedCreateBillingAgreementActions =
            mock<CreateBillingAgreementActions>();

        expect(
            buttonProps.createBillingAgreement(
                {},
                mockedCreateBillingAgreementActions
            )
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

        const mockedOnApproveData = mock<OnApproveBraintreeData>();
        const mockedOnApproveActions = mock<OnApproveBraintreeActions>();
        expect(
            buttonProps.onApprove(mockedOnApproveData, mockedOnApproveActions)
        ).toBeTruthy();
    });
});
