import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Dragonpay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("dragonpay"),
};

export default meta;

const stories = createLPMStories("dragonpay");
export const Default = stories.Default;
