import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Satispay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("satispay"),
};

export default meta;

const stories = createLPMStories("satispay");
export const Default = stories.Default;
