import React from "react";
import { action } from "@storybook/addon-actions";

import { getOptionsFromQueryString } from "../utils";
import {
    PayPalScriptProvider,
    DISPATCH_ACTION,
    SCRIPT_LOADING_STATE,
} from "../../index";
import {
    getScriptID,
    destroySDKScript,
} from "../../context/scriptProviderContext";
import { usePayPalScriptReducer } from "../../hooks/scriptProviderHooks";
import DocPageStructure from "../components/DocPageStructure";
import { getDefaultCode } from "./code";

import type { FC, ReactElement } from "react";
import type { StoryFn } from "@storybook/react";
import type { DocsContextProps } from "@storybook/addon-docs";
import type { PayPalScriptOptions } from "@paypal/paypal-js";

const scriptProviderOptions: PayPalScriptOptions = {
    clientId: "test",
    ...getOptionsFromQueryString(),
};

const LoadScriptButton: FC = () => {
    const [{ isResolved }, dispatch] = usePayPalScriptReducer();

    return (
        <div style={{ display: "inline-flex" }}>
            <button
                type="button"
                style={{ display: "block", marginBottom: "20px" }}
                disabled={isResolved}
                onClick={() => {
                    dispatch({
                        type: DISPATCH_ACTION.LOADING_STATUS,
                        value: SCRIPT_LOADING_STATE.PENDING,
                    });
                }}
            >
                Load PayPal script
            </button>
            <button
                type="button"
                style={{
                    display: "block",
                    marginBottom: "20px",
                    marginLeft: "1em",
                }}
                onClick={() => {
                    destroySDKScript(getScriptID(scriptProviderOptions));
                    dispatch({
                        type: DISPATCH_ACTION.LOADING_STATUS,
                        value: SCRIPT_LOADING_STATE.INITIAL,
                    });
                }}
            >
                Reset
            </button>
        </div>
    );
};

function PrintLoadingState(): ReactElement | null {
    const [{ isInitial, isPending, isResolved, isRejected }] =
        usePayPalScriptReducer();

    if (isInitial) {
        action("isInitial")(
            "The sdk script has not been loaded  yet. It has been deferred."
        );
    } else if (isPending) {
        action("isPending")("The sdk script is loading.");
    } else if (isResolved) {
        action("isResolved")("The sdk script has successfully loaded.");
    } else if (isRejected) {
        action("isResolved")(
            "Something went wrong. The sdk script failed to load."
        );
    }

    return null;
}

export default {
    id: "example/PayPalScriptProvider",
    title: "PayPal/PayPalScriptProvider",
    component: PayPalScriptProvider,
    parameters: {
        controls: { expanded: true },
    },
    argTypes: {
        deferLoading: {
            options: [true, false],
            control: {
                type: "select",
            },
            description:
                "Allow to defer the loading of the PayPal script. If the value is `true` you'll need to load manually.",
            table: { category: "Props" },
        },
        options: {
            control: { disable: true },
            table: { category: "Props" },
        },
    },
    args: {
        deferLoading: false,
    },
};

export const Default: FC<{ deferLoading: boolean }> = ({ deferLoading }) => {
    return (
        <PayPalScriptProvider
            options={scriptProviderOptions}
            deferLoading={deferLoading}
        >
            <LoadScriptButton />
            <PrintLoadingState />
            {/* add your paypal components here (ex: <PayPalButtons />) */}
        </PayPalScriptProvider>
    );
};

/********************
 * OVERRIDE STORIES *
 *******************/
(Default as StoryFn).parameters = {
    docs: {
        container: ({ context }: { context: DocsContextProps }) => (
            <DocPageStructure
                context={context}
                code={getDefaultCode(
                    context.getStoryContext(context.storyById(context.id)).args
                        .deferLoading
                )}
            />
        ),
    },
};
