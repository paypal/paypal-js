import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/LinkAja",
  tags: ["autodocs"],
  ...createLPMMetaExtras("linkaja"),
};

export default meta;

const stories = createLPMStories("linkaja");
export const Default = stories.Default;
