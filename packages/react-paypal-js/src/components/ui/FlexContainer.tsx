import React, { ReactNode } from "react";

export const FlexContainer: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div style={{ display: "flex", width: "100%" }}>{children}</div>;
};
