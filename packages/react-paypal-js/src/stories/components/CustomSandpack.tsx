import React from "react";
import {
    SandpackProvider,
    SandpackThemeProvider,
    SandpackPreview,
    SandpackCodeEditor,
} from "@codesandbox/sandpack-react";

import CopyButton from "./CopyButton";

import type { ReactElement } from "react";
import type {
    SandpackPredefinedTemplate,
    SandpackFile,
} from "@codesandbox/sandpack-react/dist/types/types";
import "@codesandbox/sandpack-react/dist/index.css";

// Default styles
const CUSTOM_STYLE = {
    width: "100%",
    height: "450px",
    border: "1px solid rgba(0,0,0,.1)",
    boxShadow: "rgb(0 0 0 / 10%) 0 1px 3px 0",
};

/**
 * Custom component to adjust the Sandpack react library UI to the
 * storybook requirements for a better user experience
 *
 * @param props to modify the UI behavior and source files
 * @returns a ReactElement with the customized Sandpack component
 */
const CustomSandpack = (props: {
    template?: SandpackPredefinedTemplate;
    files?: Record<string, SandpackFile>;
    customSetup?: Record<string, unknown>;
    showLineNumbers?: boolean;
    previewHeight?: string;
    codeHeight?: string;
}): ReactElement => (
    <SandpackProvider template={props.template} customSetup={props.customSetup}>
        <SandpackThemeProvider>
            <SandpackPreview
                customStyle={{
                    ...CUSTOM_STYLE,
                    height: props.previewHeight,
                    padding: "1em",
                    borderRadius: "4px 4px 0 0",
                }}
            />
            <SandpackCodeEditor
                customStyle={{
                    ...CUSTOM_STYLE,
                    height: props.codeHeight,
                    borderRadius: "0 0 4px 4px",
                }}
                showLineNumbers={props.showLineNumbers || false}
            />
            <CopyButton />
        </SandpackThemeProvider>
    </SandpackProvider>
);

export default CustomSandpack;
