import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Indonesia Banks",
  tags: ["autodocs"],
  ...createLPMMetaExtras("indonesiaBanks"),
};

export default meta;

const stories = createLPMStories("indonesiaBanks");
export const Default = stories.Default;
