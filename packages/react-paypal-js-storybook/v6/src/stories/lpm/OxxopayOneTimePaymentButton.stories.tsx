import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/OXXO",
  tags: ["autodocs"],
  ...createLPMMetaExtras("oxxopay"),
};

export default meta;

const stories = createLPMStories("oxxopay");
export const Default = stories.Default;
