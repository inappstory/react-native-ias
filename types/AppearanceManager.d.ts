import { Option } from "./types";

export declare type AppearanceCommonOptions = Partial<{
  hasFavorite: boolean;
  hasLike: boolean;
  hasLikeButton: boolean;
  hasDislikeButton: boolean;
  hasShare: boolean;
}>;

export declare type StoriesListOptions = Partial<{
  title: StoriesListTitleOptions;
  card: StoriesListCardOptions;
  favoriteCard: StoriesListFavoriteCardOptions;
  layout: Partial<{
      storiesListInnerHeight: number | null;
    height: number;
    backgroundColor: string;
    sliderAlign: StoriesListSliderAlign;
  }>;
  sidePadding: number;
  topPadding: number;
  bottomPadding: number;
  bottomMargin: number;

  navigation: Partial<{
    showControls: boolean;
    controlsSize: number;
    controlsBackgroundColor: string;
    controlsColor: string;
  }>;

  extraCss: string;

  // setCallback ?
  handleStoryLinkClick: (payload: StoriesListClickEvent) => void;

  handleStartLoad: (loaderContainer: HTMLElement) => void;
  handleStopLoad: (loaderContainer: HTMLElement) => void;


  // handleClickOnStory?: (event: StoriesListClickEvent) => void,

}>;

export declare type StoriesListTitleOptions = Partial<{
  content: string;
  color: string;
  font: string;
  marginBottom: number;
}>;

export declare enum StoriesListCardViewVariant {
  CIRCLE = 'circle',
  QUAD = 'quad',
  RECTANGLE = 'rectangle'
}

export declare enum StoriesListSliderAlign {
    CENTER = "center",
    LEFT = "left",
    RIGHT = "right"
}

export declare enum StoriesListCardTitleTextAlign {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}

export declare enum StoriesListCardTitlePosition {
    CARD_INSIDE_BOTTOM = 'cardInsideBottom',
    CARD_OUTSIDE_TOP = 'cardOutsideTop',
    CARD_OUTSIDE_BOTTOM = 'cardOutsideBottom'
}

export declare type StoriesListCardOptions = Partial<{
  title: Partial<{
    color: string;
    padding: string | number;
    font: string;
      display: boolean;
      textAlign: StoriesListCardTitleTextAlign;
      position: StoriesListCardTitlePosition;
      lineClamp: number;
  }>;
  gap: number;
  height: number;
  variant: StoriesListCardViewVariant;
  border: Partial<{
    radius: number;
    color: string;
    width: number;
    gap: number;
  }>;
  boxShadow: Option<string>;
    dropShadow: Option<string>;
  opacity: Option<number>;
  mask: Partial<{
    color: Option<string>;
  }>;
    svgMask: Partial<Option<{
        cardMask: Option<string>;
        overlayMask: Array<{
            mask: Option<string>;
            background: Option<string>;
        }>;
    }>>;
  opened: Partial<{
    border: Partial<{
      radius: Option<number>;
      color: Option<string>;
      width: Option<number>;
      gap: Option<number>;
    }>;
    boxShadow: Option<string>;
      dropShadow: Option<string>;
    opacity: Option<number>;
    mask: Partial<{
      color: Option<string>;
    }>;
      svgMask: Partial<Option<{
          cardMask: Option<string>;
          overlayMask: Array<{
              mask: Option<string>;
              background: Option<string>;
          }>;
      }>>;
  }>;
}>;

export declare type StoriesListFavoriteCardOptions = StoriesListCardOptions & Partial<{
  title: Partial<{
    content: string;
    color: string;
    padding: string | number;
    font: string;
  }>
}>;

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

export declare type StoryFavoriteReaderOptions = Partial<{
  title: Partial<{
    content: string;
      font: string;
      color: string;
  }>
}>;

export declare enum StoryReaderCloseButtonPosition {
  LEFT = 'left',
  RIGHT = 'right'
}

export declare enum StoryReaderSwipeStyle {
  FLAT = 'flat',
  COVER = 'cover',
  CUBE = 'cube'
}


export declare type StoryReaderOptions = Partial<{
  closeButtonPosition: StoryReaderCloseButtonPosition,
  scrollStyle: StoryReaderSwipeStyle,
  loader: Partial<{
    default: Partial<{
      color: Option<string>,
      accentColor: Option<string>,
    }>,
    custom: Option<string>
  }>,
    slideBorderRadius: number,
  recycleStoriesList: boolean,
  closeOnLastSlideByTimer: boolean,
    closeButton: {
        svgSrc: {
            baseState: string
        }
    },
    likeButton: {
        svgSrc: {
            baseState: string,
            activeState: string,
        }
    },
    dislikeButton: {
        svgSrc: {
            baseState: string,
            activeState: string,
        }
    },
    favoriteButton: {
        svgSrc: {
            baseState: string,
            activeState: string,
        }
    },
    muteButton: {
        svgSrc: {
            baseState: string,
            activeState: string,
        }
    },
    shareButton: {
        svgSrc: {
            baseState: string,
        }
    }
}>;

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