import {
    CreateOrderActions,
    CreateOrderData,
    OnClickActions,
} from "@paypal/paypal-js";
import { renderHook } from "@testing-library/react-hooks";
import { useProxyProps } from "./useProxyProps";

describe("useProxyProps", () => {
    test("should return an object of wrapped callbacks", () => {
        const createOrder = jest.fn().mockReturnValue("createOrder");
        const onClick = jest.fn().mockReturnValue("onClick");

        const props = {
            createOrder,
            onClick,
        };

        const {
            result: { current },
        } = renderHook(() => useProxyProps(props));

        expect(current).toHaveProperty("createOrder");
        expect(current).toHaveProperty("onClick");
        expect(current.createOrder).not.toBe(props.createOrder);
        expect(current.onClick).not.toBe(props.onClick);

        expect(
            current.createOrder!(
                {} as CreateOrderData,
                {} as CreateOrderActions,
            ),
        ).toBe("createOrder");
        expect(current.onClick!({}, {} as OnClickActions)).toBe("onClick");

        expect(props.createOrder).toHaveBeenCalled();
        expect(props.onClick).toHaveBeenCalled();

        // ensure no props mutation
        expect(props.createOrder).toBe(createOrder);
        expect(props.onClick).toBe(onClick);
    });

    test("should not wrap or mutate non-function props", () => {
        const fundingSource = ["paypal"];
        const props = {
            fundingSource,
        };

        const {
            result: { current },
        } = renderHook(() => useProxyProps(props));

        expect(current.fundingSource).toBe(props.fundingSource);
        expect(props.fundingSource).toBe(fundingSource);
    });
});
