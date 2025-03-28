import React, { ReactElement, useEffect, useRef, useState } from "react";

import { useProxyProps } from "./useProxyProps";
import { usePayPalScriptReducer } from "./scriptProviderHooks";
import { generateErrorMessage, getPayPalWindowNamespace } from "../utils";
import { SDK_SETTINGS } from "../constants";

import type {
    PayPalButtonsComponentOptions,
    PayPalButtonsComponent,
    OnInitActions,
} from "@paypal/paypal-js";

const SYMBOL_INIT_ACTIONS = Symbol("init_actions");

function useButtonsInstance(
    props: PayPalButtonsComponentOptions,
    _options?: unknown,
): {
    instance: PayPalButtonsComponent | undefined;
    isLoaded: boolean;
    forceInit: () => void;
    initActions?: OnInitActions;
} {
    const proxyProps = useProxyProps({ ...props });
    const [
        { isResolved: isPayPalScriptResolved, options: payPalScriptOptions },
    ] = usePayPalScriptReducer();

    const buttonsInstanceRef = useRef<PayPalButtonsComponent>();
    const [, forceUpdate] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);
    const [initActions, setInitActions] = useState<OnInitActions>();
    const [forceInit, setForceInit] = useState({});
    const [, setError] = useState();

    function closeButtonsComponent() {
        console.log("closeButtonsComponent");
        buttonsInstanceRef.current?.close().catch(() => {
            // ignore errors when closing the component
        });
    }

    useEffect(() => {
        setForceInit({});
    }, [proxyProps.fundingSource]);

    useEffect(() => {
        setIsLoaded(false);
        if (isPayPalScriptResolved === false) {
            return closeButtonsComponent;
        }

        const namespace = getPayPalWindowNamespace(
            payPalScriptOptions.dataNamespace,
        );

        console.log({ namespace });

        if (!namespace || !namespace.Buttons) {
            setError(() => {
                throw new Error(
                    generateErrorMessage({
                        reactComponentName: "useButtonsInstance",
                        sdkComponentKey: "buttons",
                        sdkRequestedComponents: payPalScriptOptions.components,
                        sdkDataNamespace:
                            payPalScriptOptions[SDK_SETTINGS.DATA_NAMESPACE],
                    }),
                );
            });

            return closeButtonsComponent;
        }

        const decoratedOnInit = (
            data: Record<string, unknown>,
            actions: OnInitActions,
        ) => {
            setInitActions(actions);
            if (typeof proxyProps.onInit === "function") {
                proxyProps.onInit(data, actions);
            }
        };

        try {
            buttonsInstanceRef.current = namespace.Buttons?.({
                ...proxyProps,
                onInit: decoratedOnInit,
            });
            setIsLoaded(true);
            forceUpdate({});
        } catch (error) {
            return setError(() => {
                throw new Error(`Failed to create Buttons instance: ${error}`);
            });
        }

        return closeButtonsComponent;
    }, [forceInit, proxyProps, isPayPalScriptResolved, payPalScriptOptions]);

    return {
        instance: buttonsInstanceRef.current,
        isLoaded,
        forceInit: () => setForceInit({}), // TODO not sure I like this, but we need something other than forceReRender array
        initActions,
    };
}

interface ButtonsProps {
    buttons: ButtonsInstance;
    disabled?: boolean;
}

export const Buttons = ({
    buttons,
    disabled,
}: ButtonsProps): ReactElement | null => {
    const { instance } = buttons;
    const initActions = buttons[SYMBOL_INIT_ACTIONS];

    const containerRef = useRef<HTMLDivElement>(null);
    const [isEligible, setIsEligible] = useState(true);
    const [, setError] = useState();

    useEffect(() => {
        if (!initActions) {
            return;
        }

        if (disabled === true) {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            initActions.disable().catch(() => {});
        } else {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            initActions.enable().catch(() => {});
        }
    }, [initActions, disabled]);

    useEffect(() => {
        if (!instance || !containerRef.current) {
            return;
        }

        if (!instance.isEligible()) {
            setIsEligible(false);
            return;
        }

        instance.render(containerRef.current).catch((err: Error) => {
            if (
                !containerRef.current ||
                containerRef.current.children.length === 0
            ) {
                return;
            }

            setError(() => {
                throw new Error(`Failed to render <Buttons />: ${err}`);
            });
        });
    }, [instance]);

    return isEligible && buttons ? <div ref={containerRef} /> : null;
};

interface ButtonsInstance {
    forceInit: () => void;
    instance?: PayPalButtonsComponent;
    [SYMBOL_INIT_ACTIONS]?: OnInitActions;
}
interface UseButtonsReturnType {
    isLoaded: boolean;
    buttons: ButtonsInstance;
}

export function useButtons(
    buttonsOptions: PayPalButtonsComponentOptions,
    _options?: unknown,
): UseButtonsReturnType {
    const { instance, isLoaded, forceInit, initActions } =
        useButtonsInstance(buttonsOptions);

    return {
        buttons: {
            instance,
            forceInit,
            [SYMBOL_INIT_ACTIONS]: initActions,
        },
        isLoaded,
    };
}
