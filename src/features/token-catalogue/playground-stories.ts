export type PlaygroundStoryKey = "overview" | "colors" | "type" | "components";

export type PlaygroundStoryDefinition = {
  key: PlaygroundStoryKey;
  label: string;
  description: string;
};

const playgroundStories: PlaygroundStoryDefinition[] = [
  {
    key: "overview",
    label: "Overview",
    description: "Plain Tailwind preview with basic text, color, spacing, and form surfaces."
  },
  {
    key: "colors",
    label: "Colors",
    description: "Raw swatches and semantic color roles."
  },
  {
    key: "type",
    label: "Type",
    description: "Heading, body, emphasis, and mono samples."
  },
  {
    key: "components",
    label: "Components",
    description: "Simple cards, buttons, inputs, radius, shadow, and layout blocks."
  }
];

export function listPlaygroundStories() {
  return playgroundStories;
}

export function isPlaygroundStoryKey(value: string | null | undefined): value is PlaygroundStoryKey {
  return playgroundStories.some((story) => story.key === value);
}

export function getPlaygroundStoryDefinition(key: PlaygroundStoryKey) {
  return playgroundStories.find((story) => story.key === key) ?? playgroundStories[0];
}
