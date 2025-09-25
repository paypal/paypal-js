import { createContext } from "react";

import { InstanceContextState } from "../types/InstanceProviderTypes";

export const InstanceContext = createContext<InstanceContextState | null>(null);
