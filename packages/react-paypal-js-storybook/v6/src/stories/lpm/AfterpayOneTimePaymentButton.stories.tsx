import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Afterpay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("afterpay"),
};

export default meta;

const stories = createLPMStories("afterpay");
export const Default = stories.Default;
