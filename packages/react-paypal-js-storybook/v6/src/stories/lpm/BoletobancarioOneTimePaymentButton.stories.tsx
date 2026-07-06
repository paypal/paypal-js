import type { Meta } from "@storybook/react";
import { createLPMMetaExtras, createLPMStories, type LPMStoryArgs } from "../../shared/lpm/storyFactory";

const meta: Meta<LPMStoryArgs> = {
  title: "V6/LPM/Boleto Bancário",
  tags: ["autodocs"],
  ...createLPMMetaExtras("boletobancario"),
};

export default meta;

const stories = createLPMStories("boletobancario");
export const Default = stories.Default;
