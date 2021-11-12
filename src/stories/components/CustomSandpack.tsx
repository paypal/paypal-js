import React, { ReactElement } from "react";
import {
    SandpackProvider,
    SandpackThemeProvider,
    SandpackPreview,
    SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import type {
    SandpackPredefinedTemplate,
    SandpackFile,
} from "@codesandbox/sandpack-react/dist/types/types";
import "@codesandbox/sandpack-react/dist/index.css";

// Default styles
const customStyle = {
    width: "100%",
    height: "450px",
    border: "1px solid rgba(0,0,0,.1)",
    boxShadow: "rgb(0 0 0 / 10%) 0 1px 3px 0",
};

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
                    ...customStyle,
                    height: props.previewHeight,
                    padding: "1em",
                    borderRadius: "4px 4px 0 0",
                }}
            />
            <SandpackCodeEditor
                customStyle={{
                    ...customStyle,
                    height: props.codeHeight,
                    borderRadius: "0 0 4px 4px",
                }}
                showLineNumbers={props.showLineNumbers || false}
            />
        </SandpackThemeProvider>
    </SandpackProvider>
);

export default CustomSandpack;
