import React, { useState } from "react";
import { useSandpack } from "@codesandbox/sandpack-react";

import type { ReactElement } from "react";
import type {
    FontWeightProperty,
    FloatProperty,
    PositionProperty,
} from "csstype/index";

const COPY_BUTTON = {
    padding: "4px 10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#333333",
    background: "#FFFFFF",
    fontSize: "12px",
    lineHeight: "16px",
    fontWeight: "700" as FontWeightProperty,
    border: "1px solid rgba(0,0,0,.1)",
    borderRadius: "4px 0 0 0",
    float: "right" as FloatProperty,
    position: "relative" as PositionProperty,
    top: "-26px",
};

/**
 * This component is use to copy the behavior from the Description component
 * in the storybook Doc pages. It use the state of the Sandpack library
 * to get the code inside the App.js file and write it into the clipboard
 *
 * @returns a ReactElement with the custom copy button
 */
const CopyButton = (): ReactElement => {
    const { sandpack } = useSandpack();
    const [isCopy, setIsCopy] = useState<boolean>(false);

    const getCopyBorder = () => (isCopy ? "2px solid #1DA7FD" : "none");

    const onClickHandler = () => {
        navigator.clipboard.writeText(sandpack.files[sandpack.activePath].code);
        setIsCopy(true);
        // Same behavior from default Description storybook component
        setTimeout(() => {
            setIsCopy(false);
        }, 1000);
    };

    return (
        <button
            onClick={onClickHandler}
            style={{ ...COPY_BUTTON, borderBottom: getCopyBorder() }}
        >
            {isCopy ? "Copied" : "Copy"}
        </button>
    );
};

export default CopyButton;
