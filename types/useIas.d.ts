import StoryManager from "./StoryManager";
import AppearanceManager from "./AppearanceManager";


export default function (createStoryManager: () => StoryManager, createAppearanceManager: () => AppearanceManager):
  {
    storyManager: StoryManager,
    appearanceManager: AppearanceManager
  };

export {};