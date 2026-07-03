import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Indonesia Banks",
  ...createLPMMetaExtras("indonesiaBanks"),
};

export default meta;

const stories = createLPMStories("indonesiaBanks");
export const Default = stories.Default;
export const EagerOrder = stories.EagerOrder;
export const WithHookPattern = stories.WithHookPattern;
