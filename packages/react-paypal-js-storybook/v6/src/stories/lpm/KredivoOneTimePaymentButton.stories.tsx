import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Kredivo",
  ...createLPMMetaExtras("kredivo"),
};

export default meta;

const stories = createLPMStories("kredivo");
export const Default = stories.Default;
export const EagerOrder = stories.EagerOrder;
export const WithHookPattern = stories.WithHookPattern;
