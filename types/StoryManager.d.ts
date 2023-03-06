import {Option} from "./types";
import EventEmitter from "./EventEmitter";
import AppearanceManager from "./AppearanceManager";
import {Dict} from "../../../global.h";

export declare type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string|number>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: string;
};

export declare type OnboardingLoadStatus = {
    feed: string|number,
    defaultListLength: number,
    favoriteListLength: number,
    success: boolean,
    error: Option<{
        name: string,
        networkStatus: number,
        networkMessage: string
    }>
};

export enum AndroidWindowSoftInputMode {
    AdjustNothing = 'AdjustNothing',
    AdjustPan = 'AdjustPan',
    AdjustResize = 'AdjustResize',
    AdjustUnspecified = 'AdjustUnspecified',
    AlwaysHidden = 'AlwaysHidden',
    AlwaysVisible = 'AlwaysVisible',
    Visible = 'Visible',
    Hidden = 'Hidden',
    Unchanged = 'Unchanged',
}


declare class StoryManager extends EventEmitter {
  constructor(config: StoryManagerConfig);
  static getInstance(): StoryManager;
  showStory(storyId: number|string, appearanceManager: AppearanceManager): Promise<{loaded: boolean}>;
  closeStoryReader(): Promise<void>;
  showOnboardingStories(appearanceManager: AppearanceManager, customTags?: Array<string>): Promise<OnboardingLoadStatus>;
  set androidDefaultWindowSoftInputMode(mode: AndroidWindowSoftInputMode);

  setTags(tags: Array<string>): void;
  setUserId(userId: string | number): void;
  setPlaceholders(placeholders: Dict<string>): void;
  setLang(lang: string): void;


}

export default StoryManager;
export {};
