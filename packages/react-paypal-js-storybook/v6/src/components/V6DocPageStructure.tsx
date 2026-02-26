import React from "react";
import {
    Title,
    Subtitle,
    Description,
    ArgTypes,
    Source,
    Canvas,
    Primary,
} from "@storybook/addon-docs/blocks";

/**
 * Component for V6 documentation pages - shows live button preview and code example
 * Uses Storybook's Canvas and Primary components for Storybook 10.x
 *
 * @param param custom props
 * @returns an Element with the DocPage structure
 */
const V6DocPageStructure = ({
    code = "",
}: {
    code: string;
}): React.JSX.Element => (
    <>
        <Title />
        <Subtitle />
        <Description />
        <Canvas sourceState="none">
            <Primary />
        </Canvas>
        <h3>Example Code</h3>
        <Source language="tsx" code={code} dark={false} />
        <ArgTypes />
    </>
);

export default V6DocPageStructure;
