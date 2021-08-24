import { decorateActions } from "./utils";

describe("decorateActions", () => {
    test("shouldn't modify the button props", () => {
        const buttonProps = {
            disabled: false,
            children: null,
            onClick: () => null,
            onInit: () => null,
        };

        decorateActions(buttonProps);
        decorateActions(buttonProps, {});
        expect(buttonProps).toMatchInlineSnapshot(
            buttonProps,
            `
            Object {
              "children": null,
              "disabled": false,
              "onClick": [Function],
              "onInit": [Function],
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

        const buttonProps = decorateActions(buttonPropsWithCreateOrder, {
            create: jest.fn(),
        });

        expect(buttonProps.createOrder({}, {})).toBeTruthy();
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

        const buttonProps = decorateActions(buttonPropsWithOnApprove, {
            create: jest.fn(),
        });

        expect(buttonProps.onApprove({}, {})).toBeTruthy();
    });
});
