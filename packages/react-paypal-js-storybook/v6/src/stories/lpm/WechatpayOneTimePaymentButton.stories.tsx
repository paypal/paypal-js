import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/WeChat Pay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("wechatpay"),
};

export default meta;

const stories = createLPMStories("wechatpay");
export const Default = stories.Default;
