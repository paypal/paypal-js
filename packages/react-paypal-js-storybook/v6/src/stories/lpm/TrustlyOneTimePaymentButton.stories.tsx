import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Trustly",
  tags: ["autodocs"],
  ...createLPMMetaExtras("trustly"),
};

export default meta;

const stories = createLPMStories("trustly");
export const Default = stories.Default;
