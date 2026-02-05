"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * Uses useLayoutEffect on client (runs before paint) and useEffect on server (avoids warning).
 * This ensures state updates happen before the browser paints, preventing visual flashes.
 */
export const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
