import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/GrabPay",
  ...createLPMMetaExtras("grabpay"),
};

export default meta;
export const { Default, EagerOrder, WithHookPattern } = createLPMStories("grabpay");
