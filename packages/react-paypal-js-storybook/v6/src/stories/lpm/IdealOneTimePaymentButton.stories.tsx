import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/iDEAL",
  tags: ["autodocs"],
  ...createLPMMetaExtras("ideal"),
};

export default meta;

const stories = createLPMStories("ideal");
export const Default = stories.Default;
