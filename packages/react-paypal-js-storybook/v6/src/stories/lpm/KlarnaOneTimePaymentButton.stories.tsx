import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Klarna",
  tags: ["autodocs"],
  ...createLPMMetaExtras("klarna"),
};

export default meta;

const stories = createLPMStories("klarna");
export const Default = stories.Default;
