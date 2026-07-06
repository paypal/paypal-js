import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Paysera",
  tags: ["autodocs"],
  ...createLPMMetaExtras("paysera"),
};

export default meta;

const stories = createLPMStories("paysera");
export const Default = stories.Default;
