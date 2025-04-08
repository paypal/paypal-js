import React, {
    MutableRefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { useProxyProps } from "./useProxyProps";
import { usePayPalScriptReducer } from "./scriptProviderHooks";
import { generateErrorMessage, getPayPalWindowNamespace } from "../utils";
import { SDK_SETTINGS } from "../constants";
import { ButtonsAPI, ButtonsComponentProps } from "../core/buttons/api";

import type {
    PayPalButtonsComponentOptions,
    PayPalButtonsComponent,
    OnInitActions,
} from "@paypal/paypal-js";

function useButtonsInstance(
    props: PayPalButtonsComponentOptions,
    _options?: unknown,
): {
    instance:
        | (PayPalButtonsComponent & {
              hasReturned: () => boolean;
              resume: () => void;
          })
        | undefined;
    initActionsRef?: MutableRefObject<OnInitActions | undefined>;
} {
    const proxyProps = useProxyProps({ ...props });
    const [
        { isResolved: isPayPalScriptResolved, options: payPalScriptOptions },
    ] = usePayPalScriptReducer();

    const buttonsInstanceRef = useRef<
        PayPalButtonsComponent & {
            hasReturned: () => boolean;
            resume: () => void;
        }
    >();
    const [, forceUpdate] = useState({});
    const initActionsRef = useRef<OnInitActions>();
    const [forceInit, setForceInit] = useState({});
    const [, setError] = useState();

    function closeButtonsComponent() {
        buttonsInstanceRef.current?.close().catch(() => {
            // ignore errors when closing the component
        });
    }

    useEffect(() => {
        setForceInit({});
    }, [proxyProps.fundingSource]);

    useEffect(() => {
        if (isPayPalScriptResolved === false) {
            return closeButtonsComponent;
        }

        const namespace = getPayPalWindowNamespace(
            payPalScriptOptions.dataNamespace,
        );

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
            initActionsRef.current = actions;
            if (typeof proxyProps.onInit === "function") {
                proxyProps.onInit(data, actions);
            }
            forceUpdate({});
        };

        try {
            buttonsInstanceRef.current = namespace.Buttons?.({
                ...proxyProps,
                onInit: decoratedOnInit,
            }) as PayPalButtonsComponent & {
                hasReturned: () => boolean;
                resume: () => void;
            };
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
        initActionsRef: initActionsRef,
    };
}

type UseButtonsWithRefAndButtonsReturnType = Omit<
    ButtonsAPI,
    "_update" | "options" | "publicAPI"
>;

export function usePayPalButtons(
    buttonOptions: PayPalButtonsComponentOptions & {
        appSwitchWhenAvailable?: boolean;
    },
    _options?: unknown,
): UseButtonsWithRefAndButtonsReturnType {
    const { instance, initActionsRef } = useButtonsInstance(buttonOptions);
    const containerElement = useRef<HTMLDivElement | null>(null);
    const [, setError] = useState();
    const [, update] = useState({});
    const [ready, setReady] = useState(false);

    const [buttonsAPI] = useState(() => {
        const api = new ButtonsAPI({
            handleUpdate: () => update({}),
        });

        api.Buttons = function Buttons({
            disabled = false,
        }: ButtonsComponentProps) {
            useEffect(() => {
                if (initActionsRef?.current) {
                    if (disabled === true) {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        initActionsRef.current.disable().catch(() => {});
                    } else {
                        // eslint-disable-next-line @typescript-eslint/no-empty-function
                        initActionsRef.current.enable().catch(() => {});
                    }
                }
            }, [disabled, initActionsRef?.current]); // eslint-disable-line react-hooks/exhaustive-deps

            useLayoutEffect(() => {
                setReady(true);

                return () => setReady(false);
            }, []);

            return <div ref={containerElement} />;
        };

        if (instance) {
            buttonsAPI._update({ instance });
        }

        return api;
    });

    useEffect(() => {
        if (!instance) {
            return;
        }

        buttonsAPI._update({ instance });

        if (!ready || !containerElement.current) {
            return;
        }

        instance.render(containerElement.current).catch((err: Error) => {
            if (
                !containerElement.current ||
                containerElement.current.children.length === 0
            ) {
                return;
            }

            setError(() => {
                throw new Error(`Failed to render <Buttons />: ${err}`);
            });
        });
    }, [instance, buttonsAPI, ready]);

    const { Buttons, isEligible, hasReturned, resume } = buttonsAPI;

    return { Buttons, isEligible, hasReturned, resume };
}
