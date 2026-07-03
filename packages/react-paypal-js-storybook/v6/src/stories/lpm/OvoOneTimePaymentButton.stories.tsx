import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/OVO",
  ...createLPMMetaExtras("ovo"),
};

export default meta;
export const { Default, EagerOrder, WithHookPattern } = createLPMStories("ovo");
