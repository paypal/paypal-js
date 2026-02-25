/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly STORYBOOK_PAYPAL_API_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
