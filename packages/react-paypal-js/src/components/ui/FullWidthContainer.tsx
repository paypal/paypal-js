import React, { ReactNode } from "react";

export const FullWidthContainer: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    return <div style={{ width: "100%" }}>{children}</div>;
};
