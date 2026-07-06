import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Latvia Banks",
  tags: ["autodocs"],
  ...createLPMMetaExtras("latviaBanks"),
};

export default meta;

const stories = createLPMStories("latviaBanks");
export const Default = stories.Default;
