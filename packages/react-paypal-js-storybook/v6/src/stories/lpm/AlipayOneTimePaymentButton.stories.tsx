import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Alipay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("alipay"),
};

export default meta;

const stories = createLPMStories("alipay");
export const Default = stories.Default;
