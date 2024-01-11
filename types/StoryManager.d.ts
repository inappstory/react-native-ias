import { Option } from "./types";
import EventEmitter from "./EventEmitter";
import AppearanceManager from "./AppearanceManager";
import { Dict } from "../../../global.h";
import { Url } from "../../../src/story-manager/common.h";

export declare type StoryManagerConfig = {
    apiKey: string;
    userId?: Option<string | number>;
    tags?: Option<Array<string>>;
    placeholders?: Option<Dict<string>>;
    lang?: string;
    defaultMuted?: boolean;
};

export declare type OnboardingLoadStatus = {
    feed: string | number;
    defaultListLength: number;
    favoriteListLength: number;
    success: boolean;
    error: Option<{
        name: string;
        networkStatus: number;
        networkMessage: string;
    }>;
};

export enum AndroidWindowSoftInputMode {
    AdjustNothing = "AdjustNothing",
    AdjustPan = "AdjustPan",
    AdjustResize = "AdjustResize",
    AdjustUnspecified = "AdjustUnspecified",
    AlwaysHidden = "AlwaysHidden",
    AlwaysVisible = "AlwaysVisible",
    Visible = "Visible",
    Hidden = "Hidden",
    Unchanged = "Unchanged",
}

export declare type ClickPayload = {
    id: number;
    index: number;
    url: string;
};

export declare type ClickHandlerPayload = {
    data: ClickPayload;
};

declare class StoryManager extends EventEmitter {
    constructor(config: StoryManagerConfig);
    static getInstance(): StoryManager;
    showStory(storyId: number | string, appearanceManager: AppearanceManager): Promise<{ loaded: boolean }>;
    closeStoryReader(): Promise<void>;
    showOnboardingStories(
        appearanceManager: AppearanceManager,
        options?: { feed?: Option<string>; customTags?: Array<string>; limit?: Option<number> }
    ): Promise<OnboardingLoadStatus>;
    set androidDefaultWindowSoftInputMode(mode: AndroidWindowSoftInputMode);

    setTags(tags: Array<string>): void;
    setUserId(userId: string | number | null): void;
    setPlaceholders(placeholders: Dict<string>): void;
    setLang(lang: string): void;

    set soundOn(value: boolean);
    get soundOn(): boolean;
    get sdkVersionName(): string;
    get sdkVersionCode(): number;

    set storyLinkClickHandler(callback: (payload: ClickHandlerPayload) => void);
}

export default StoryManager;
export {};
