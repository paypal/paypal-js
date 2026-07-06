import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Jeniuspay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("jeniuspay"),
};

export default meta;

const stories = createLPMStories("jeniuspay");
export const Default = stories.Default;
