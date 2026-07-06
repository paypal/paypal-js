import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Scalapay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("scalapay"),
};

export default meta;

const stories = createLPMStories("scalapay");
export const Default = stories.Default;
