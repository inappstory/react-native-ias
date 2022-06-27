import {Option} from "./types";

export declare type AppearanceCommonOptions = {
  hasFavorite?: boolean;
  hasLike?: boolean;
  hasShare?: boolean;
};

export declare type StoriesListOptions = {
  title: StoriesListTitleOptions;
  card: StoriesListCardOptions;
  favoriteCard: StoriesListFavoriteCardOptions;
  layout: {
    height: number;
    backgroundColor: string;
  };
  sidePadding: number;
  topPadding: number;
  bottomPadding: number;
  bottomMargin: number;

  navigation: {
    showControls: boolean;
    controlsSize: number;
    controlsBackgroundColor: string;
    controlsColor: string;
  };

  extraCss?: string;

  // setCallback ?
  handleStoryLinkClick?: (payload: StoriesListClickEvent) => void;

  handleStartLoad?: (loaderContainer: HTMLElement) => void;
  handleStopLoad?: (loaderContainer: HTMLElement) => void;


  // handleClickOnStory?: (event: StoriesListClickEvent) => void,

}

export declare type StoriesListTitleOptions = {
  content: string;
  color: string;
  font: string;
  marginBottom: number;
}

export declare enum StoriesListCardViewVariant {
  CIRCLE = 'circle',
  QUAD = 'quad',
  RECTANGLE = 'rectangle'
}

export declare type StoriesListCardOptions = {
  title: {
    color: string;
    padding: string | number;
    font: string;
  };
  gap: number;
  height: number;
  variant: StoriesListCardViewVariant;
  border: {
    radius: number;
    color: string;
    width: number;
    gap: number;
  };
  boxShadow: Option<string>;
    dropShadow?: Option<string>;
  opacity: Option<number>;
  mask: {
    color: Option<string>;
  };
    svgMask?: Option<{
        cardMask: Option<string>;
        overlayMask: Array<{
            mask: Option<string>;
            background: Option<string>;
        }>;
    }>;
  opened: {
    border: {
      radius: Option<number>;
      color: Option<string>;
      width: Option<number>;
      gap: Option<number>;
    };
    boxShadow: Option<string>;
      dropShadow?: Option<string>;
    opacity: Option<number>;
    mask: {
      color: Option<string>;
    };
      svgMask?: Option<{
          cardMask: Option<string>;
          overlayMask: Array<{
              mask: Option<string>;
              background: Option<string>;
          }>;
      }>;
  };
}

export declare type StoriesListFavoriteCardOptions = StoriesListCardOptions & {
  title: {
    content: string;
    color: string;
    padding: string | number;
    font: string;
  }
};

export declare type StoriesListClickEvent = {
  id: number,
  index: number,
  isDeeplink: boolean,
  url: string|undefined,
};

export declare enum StoriesListEvents {
  START_LOADER = 'startLoad',
  END_LOADER = 'endLoad',
}

export declare type StoryFavoriteReaderOptions = {
  title?: {
    content: string;
  }
};

export declare enum StoryReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right'
}

export declare enum StoryReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube'
}


export declare type StoryReaderOptions = {
  closeButtonPosition: StoryReaderCloseButtonPosition,
  scrollStyle: StoryReaderSwipeStyle,
  loader?: {
    default: {
      color: Option<string>,
      accentColor: Option<string>,
    },
    custom: Option<string>
  },
  recycleStoriesList?: boolean,
  closeOnLastSlideByTimer?: boolean,
};

declare class AppearanceManager {
  public setCommonOptions(options: AppearanceCommonOptions): AppearanceManager;

  public get commonOptions(): AppearanceCommonOptions;

  public setStoriesListOptions(options: StoriesListOptions): AppearanceManager;

  public get storiesListOptions(): StoriesListOptions;

  public setStoryReaderOptions(options: StoryReaderOptions): AppearanceManager;

  public get storyReaderOptions(): StoryReaderOptions;

  public setStoryFavoriteReaderOptions(options: StoryFavoriteReaderOptions): AppearanceManager;

  public get storyFavoriteReaderOptions(): StoryFavoriteReaderOptions;

  // public setGoodsWidgetOptions(options: GoodsWidgetOptions): AppearanceManager;
  // public get goodsWidgetOptions(): GoodsWidgetOptions;

}

export default AppearanceManager;
export {};