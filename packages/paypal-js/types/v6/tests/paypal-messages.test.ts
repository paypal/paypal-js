import type { PayPalMessagesSession } from "../index";

// The SDK always resolves fetchContent to a MessageContent object — on an API
// error it returns an empty sentinel (empty messageItems) rather than null. These
// compile-time assertions lock that contract in: if the return type ever regresses
// to `MessageContent | null`, the @ts-expect-error below becomes unused and tsc fails.
type FetchResult = Awaited<ReturnType<PayPalMessagesSession["fetchContent"]>>;

// A MessageContent object is assignable to the resolved type.
export const messageContent: FetchResult = {
  messageItems: { mainItems: [], actionItems: [] },
};

// null is NOT assignable to the non-nullable return type.
// @ts-expect-error fetchContent must not resolve to null
export const nullMessageContent: FetchResult = null;
