import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/FPX",
  tags: ["autodocs"],
  ...createLPMMetaExtras("fpx"),
};

export default meta;

const stories = createLPMStories("fpx");
export const Default = stories.Default;
