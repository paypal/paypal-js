import type {
    components,
    operations,
    paths,
} from "./openapi/checkout_orders_v2";

export interface CheckoutOrdersV2 {
    components: components;
    operations: operations;
    paths: paths;
}

export type CreateOrderRequestBody =
    CheckoutOrdersV2["components"]["schemas"]["order_request"];
export type OrderResponseBody =
    CheckoutOrdersV2["components"]["schemas"]["order"];
export type PatchOrderRequestBody =
    CheckoutOrdersV2["components"]["schemas"]["patch_request"];
