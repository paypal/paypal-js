import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/OVO",
  tags: ["autodocs"],
  ...createLPMMetaExtras("ovo"),
};

export default meta;

const stories = createLPMStories("ovo");
export const Default = stories.Default;
