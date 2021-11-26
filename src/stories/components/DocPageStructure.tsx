import React from "react";
import {
    DocsContainer,
    Title,
    Subtitle,
    Description,
    ArgsTable,
    CURRENT_SELECTION,
} from "@storybook/addon-docs";
import dedent from "ts-dedent";

import type { DocsContextProps } from "@storybook/addon-docs/dist/ts3.9/blocks";

import CustomSandpack from "./CustomSandpack";
import { SANDPACK_STYLES } from "../constants";

/**
 * Component to override the default DocPage structure from the storybook
 *
 * @param param custom props and context
 * @returns an Element with the DocPage new structure
 */
const DocPageStructure = ({
    context,
    code = "",
    options = { previewHeight: "450px", codeHeight: "600px" },
}: {
    context: DocsContextProps;
    code: string;
    options?: { previewHeight: string; codeHeight: string };
}): JSX.Element => (
    <DocsContainer context={context}>
        <Title />
        <Subtitle />
        <Description />
        <CustomSandpack
            template="react"
            customSetup={{
                dependencies: {
                    "@paypal/react-paypal-js": "latest",
                },
                entry: "/index.js",
                files: {
                    "/App.js": dedent`${code}`,
                    "/styles.css": {
                        code: dedent`${SANDPACK_STYLES}`,
                        hidden: true,
                    },
                },
            }}
            showLineNumbers={true}
            previewHeight={options?.previewHeight || "450px"}
            codeHeight={options?.codeHeight || "600px"}
        />
        <ArgsTable story={CURRENT_SELECTION} />
    </DocsContainer>
);

export default DocPageStructure;
