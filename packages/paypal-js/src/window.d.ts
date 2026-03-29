export {};

declare global {
    interface Window {
        __paypalActiveUnloadSuppressions?: number;
        __paypalOriginalAddEventListener?: Window["addEventListener"];
    }
}
