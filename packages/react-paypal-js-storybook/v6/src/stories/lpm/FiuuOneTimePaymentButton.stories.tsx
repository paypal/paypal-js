import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/FIUU",
  tags: ["autodocs"],
  ...createLPMMetaExtras("fiuu"),
};

export default meta;

const stories = createLPMStories("fiuu");
export const Default = stories.Default;
