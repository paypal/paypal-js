import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Thailand Banks",
  tags: ["autodocs"],
  ...createLPMMetaExtras("thailandBanks"),
};

export default meta;

const stories = createLPMStories("thailandBanks");
export const Default = stories.Default;
