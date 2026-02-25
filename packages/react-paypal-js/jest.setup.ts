import "@testing-library/jest-dom";

// Export empty object to satisfy server-only module resolution via moduleNameMapper
// The server-only package throws when imported on the client, but tests need to import it
export {};
