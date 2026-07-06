import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Wero",
  tags: ["autodocs"],
  ...createLPMMetaExtras("wero"),
};

export default meta;

const stories = createLPMStories("wero");
export const Default = stories.Default;
