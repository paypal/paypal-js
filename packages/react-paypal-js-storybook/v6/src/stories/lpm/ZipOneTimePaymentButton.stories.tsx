import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Zip",
  tags: ["autodocs"],
  ...createLPMMetaExtras("zip"),
};

export default meta;

const stories = createLPMStories("zip");
export const Default = stories.Default;
