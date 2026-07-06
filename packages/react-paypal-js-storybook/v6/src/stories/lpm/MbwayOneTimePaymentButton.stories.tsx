import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/MB WAY",
  tags: ["autodocs"],
  ...createLPMMetaExtras("mbway"),
};

export default meta;

const stories = createLPMStories("mbway");
export const Default = stories.Default;
