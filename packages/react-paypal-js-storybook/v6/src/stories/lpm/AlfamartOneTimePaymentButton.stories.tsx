import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Alfamart",
  tags: ["autodocs"],
  ...createLPMMetaExtras("alfamart"),
};

export default meta;

const stories = createLPMStories("alfamart");
export const Default = stories.Default;
