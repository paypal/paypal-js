import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Multibanco",
  tags: ["autodocs"],
  ...createLPMMetaExtras("multibanco"),
};

export default meta;

const stories = createLPMStories("multibanco");
export const Default = stories.Default;
