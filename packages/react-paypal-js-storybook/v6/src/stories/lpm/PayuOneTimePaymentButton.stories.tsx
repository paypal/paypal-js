import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/PayU",
  tags: ["autodocs"],
  ...createLPMMetaExtras("payu"),
};

export default meta;

const stories = createLPMStories("payu");
export const Default = stories.Default;
