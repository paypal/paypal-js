import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Paysafecard",
  tags: ["autodocs"],
  ...createLPMMetaExtras("paysafecard"),
};

export default meta;

const stories = createLPMStories("paysafecard");
export const Default = stories.Default;
