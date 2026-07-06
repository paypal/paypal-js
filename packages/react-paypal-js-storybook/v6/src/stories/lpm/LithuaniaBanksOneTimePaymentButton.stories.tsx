import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Lithuania Banks",
  tags: ["autodocs"],
  ...createLPMMetaExtras("lithuaniaBanks"),
};

export default meta;

const stories = createLPMStories("lithuaniaBanks");
export const Default = stories.Default;
