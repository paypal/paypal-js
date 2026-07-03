import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Bancontact",
  ...createLPMMetaExtras("bancontact"),
};

export default meta;
export const { Default, EagerOrder, WithHookPattern } = createLPMStories("bancontact");
