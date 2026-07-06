import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/SEPA",
  tags: ["autodocs"],
  ...createLPMMetaExtras("sepa"),
};

export default meta;

const stories = createLPMStories("sepa");
export const Default = stories.Default;
