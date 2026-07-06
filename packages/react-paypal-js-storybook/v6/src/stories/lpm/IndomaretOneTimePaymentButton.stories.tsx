import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Indomaret",
  tags: ["autodocs"],
  ...createLPMMetaExtras("indomaret"),
};

export default meta;

const stories = createLPMStories("indomaret");
export const Default = stories.Default;
