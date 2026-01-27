/**
 * V6-specific utility functions for mocking and testing
 */

import { MOCK_ORDER_ID, MOCK_SUBSCRIPTION_ID } from "../constants";

/**
 * Generates a random string for unique IDs
 */
export function generateRandomString(length = 10): string {
    return Math.random()
        .toString(36)
        .substring(2, length + 2);
}

/**
 * Creates a mock order for V6 testing
 * TODO: Replace with actual V6 API call
 */
export async function createMockOrder(amount = "100.00"): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return `${MOCK_ORDER_ID}_${generateRandomString()}`;
}

/**
 * Approves a mock order for V6 testing
 * TODO: Replace with actual V6 API call
 */
export async function approveMockOrder(orderId: string): Promise<{
    orderId: string;
    status: string;
    timestamp: number;
}> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        orderId,
        status: "COMPLETED",
        timestamp: Date.now(),
    };
}

/**
 * Creates a mock subscription for V6 testing
 * TODO: Replace with actual V6 API call
 */
export async function createMockSubscription(planId: string): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return `${MOCK_SUBSCRIPTION_ID}_${generateRandomString()}`;
}

/**
 * Common V6 button props for stories
 */
export const defaultV6ButtonProps = {
    onInit: () => {
        console.log("[V6] Component initialized");
    },
    onClick: () => {
        console.log("[V6] Button clicked");
    },
    onError: (error: Error) => {
        console.error("[V6] Error occurred:", error);
    },
    onCancel: () => {
        console.log("[V6] Payment cancelled");
    },
};
