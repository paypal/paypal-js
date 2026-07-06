import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Crypto",
  tags: ["autodocs"],
  ...createLPMMetaExtras("crypto"),
};

export default meta;

const stories = createLPMStories("crypto");
export const Default = stories.Default;
