import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Bancomat Pay",
  tags: ["autodocs"],
  ...createLPMMetaExtras("bancomatPay"),
};

export default meta;

const stories = createLPMStories("bancomatPay");
export const Default = stories.Default;
