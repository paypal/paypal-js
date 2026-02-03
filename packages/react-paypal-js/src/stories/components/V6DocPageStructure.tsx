import React from "react";
import {
    DocsContainer,
    Title,
    Subtitle,
    Description,
    ArgsTable,
    CURRENT_SELECTION,
    Source,
    Canvas,
    Story,
} from "@storybook/addon-docs";

import type { DocsContextProps } from "@storybook/addon-docs/dist/ts3.9/blocks";

/**
 * Component for V6 documentation pages - shows live button preview and code example
 * Uses Storybook's Canvas and Story components instead of Sandpack
 *
 * @param param custom props and context
 * @returns an Element with the DocPage structure
 */
const V6DocPageStructure = ({
    context,
    code = "",
}: {
    context: DocsContextProps;
    code: string;
}): JSX.Element => (
    <DocsContainer context={context}>
        <Title />
        <Subtitle />
        <Description />
        <Canvas>
            <Story id={context.id} />
        </Canvas>
        <h3>Example Code</h3>
        <Source language="tsx" code={code} dark={false} />
        <ArgsTable story={CURRENT_SELECTION} />
    </DocsContainer>
);

export default V6DocPageStructure;
