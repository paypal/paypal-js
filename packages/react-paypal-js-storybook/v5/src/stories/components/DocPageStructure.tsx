import React from "react";
import {
  Title,
  Subtitle,
  Description,
  ArgTypes,
  Source,
} from "@storybook/addon-docs/blocks";
import dedent from "ts-dedent";

import CustomSandpack from "./CustomSandpack";
import { SANDPACK_STYLES } from "../constants";

/**
 * Component to override the default DocPage structure from the storybook.
 *
 * The primary `code` is rendered in an editable Sandpack sandbox. Any
 * `additionalExamples` (e.g. alternative stories from the same file) are
 * rendered as read-only source blocks below it, since Storybook 10 autodocs
 * renders a single docs page per component instead of one per story.
 *
 * @param param custom props
 * @returns an Element with the DocPage new structure
 */
const DocPageStructure = ({
  code = "",
  additionalExamples = [],
  options = { previewHeight: "450px", codeHeight: "600px" },
}: {
  code: string;
  additionalExamples?: Array<{ title: string; code: string }>;
  options?: { previewHeight: string; codeHeight: string };
}): JSX.Element => (
  <>
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
    {additionalExamples.map(({ title, code }) => (
      <React.Fragment key={title}>
        <h3>{title}</h3>
        <Source language="tsx" code={code} dark={false} />
      </React.Fragment>
    ))}
    <ArgTypes />
  </>
);

export default DocPageStructure;
