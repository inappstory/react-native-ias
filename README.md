# react-native-ias

SDK for [InAppStory](https://inappstory.com)

## Sample project
[Repository](https://github.com/inappstory/RNIasDemo)

## Installation

Precondition RN 0.64+

```bash
npm install --save react-native-ias react-native-webview@">=11.0.0" react-native-get-random-values@">=1.0.0" react-native-device-info@">=9.0.0" @react-native-async-storage/async-storage@">=1.0.0" react-native-share@">=7.0.0"
cd ios
pod install
```

**Note**: If your application requires the ability to share base64 files on Android (share story as image), you need to add
```xml
<!-- required for react-native-share base64 sharing -->
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```
to your application's AndroidManifest.xml

## Usage

1. Register StoryReader at App root
   App entry point

```js
import {StoryReader, useIas} from "packages/react-native-ias/index";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

export default function App() {

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Main" component={MainScreen}/>
            </Stack.Navigator>

            <StoryReader storyManager={useIas(createStoryManager, createAppearanceManager).storyManager}/>

        </NavigationContainer>
    );
}
```

2. Write sdk config (in file StoriesConfig for example)

```js
import {
    AppearanceManager,
    StoriesListCardViewVariant,
    StoryManager,
    StoryReaderCloseButtonPosition, StoryReaderSwipeStyle
} from "react-native-ias";

const storyManagerConfig = {
    apiKey: "{projectToken}",
    userId: "123456",
    tags: [],
    placeholders: {
        user: "Guest"
    },
    lang: "en",
};

export const createStoryManager = () => new StoryManager(storyManagerConfig);

export const createAppearanceManager = () => {
    return new AppearanceManager().setCommonOptions({
        hasLike: true,
        hasFavorite: true
    }).setStoriesListOptions({
        title: {
            content: '',
            color: '#000',
            font: 'normal',
            marginBottom: 20,
        },
        card: {
            title: {
                color: 'black',
                font: '14px/16px "InternalPrimary"',
                padding: 8
            },
            gap: 10,
            height: 100,
            variant: StoriesListCardViewVariant.QUAD,
            border: {
                radius: 20,
                color: 'blue',
                width: 2,
                gap: 3,
            },
            boxShadow: null,
            opacity: 1,
            mask: {
                color: 'rgba(34, 34, 34, 0.3)'
            },
            opened: {
                border: {
                    radius: null,
                    color: 'red',
                    width: null,
                    gap: null,
                },
                boxShadow: null,
                opacity: null,
                mask: {
                    color: 'rgba(34, 34, 34, 0.1)'
                },
            },
        },
        favoriteCard: {},
        layout: {
            height: 0,
            backgroundColor: 'transparent'
        },
        sidePadding: 20,
        topPadding: 20,
        bottomPadding: 20,
        bottomMargin: 0,
        navigation: {
            showControls: false,
            controlsSize: 48,
            controlsBackgroundColor: 'white',
            controlsColor: 'black'
        },
    }).setStoryReaderOptions({
        closeButtonPosition: StoryReaderCloseButtonPosition.RIGHT,
        scrollStyle: StoryReaderSwipeStyle.FLAT,
    }).setStoryFavoriteReaderOptions({
        title: {
            content: 'Favorite'
        }
    })
};

```

3. Register StoriesList component at Screen with stories

```ts
import {createAppearanceManager, createStoryManager} from "../StoriesConfig";
import {StoriesList, useIas} from "react-native-ias";

type ListLoadStatus = {
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

export function StoryListScreen() {
    const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);
    const onLoadEnd = (listLoadStatus: ListLoadStatus) => {console.log({listLoadStatus})};
    return <StoriesList storyManager={storyManager} appearanceManager={appearanceManager} feed="default" onLoadEnd={onLoadEnd} />;
}

```

### Example - component with skeleton loader for StoriesList
```ts
import {StyleSheet, View, Animated} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import {createAppearanceManager, createStoryManager} from "../StoriesConfig";
import {StoriesList, useIas, ListLoadStatus} from "react-native-ias";
import ContentLoader, { Rect } from "react-content-loader/native";
import { Dimensions } from 'react-native';

const windowWidth = Dimensions.get('window').width;

enum LoadStatus {
    loading = "Loading",
    success = "LoadSuccess",
    fail = "LoadFail"
}

/**
 * DEPS
 * npm i react-content-loader react-native-svg --save
 */

export function StoryListComponent() {

    const feedId = "default";

    const [loadStatus, setLoadStatus] = useState<LoadStatus>(LoadStatus.loading);

    const loadStartAtRef = useRef(new Date().getTime());

    const fallbackTimer = useRef(null as unknown as number);

    useEffect(() => {
        fallbackTimer.current = setTimeout(() => {
            onLoadEnd({defaultListLength: 0, favoriteListLength: 0, success: false, feed: feedId, error: null});
        }, 10000);
        return () => {
            fallbackTimer.current && clearTimeout(fallbackTimer.current);
        }
    }, []);

    const onLoadEnd = (listLoadStatus: ListLoadStatus) => {
        const minTime = 500;
        const now = new Date().getTime();
        const diff = Math.max(0, minTime - (now - loadStartAtRef.current));

        setTimeout(() => {
            if (listLoadStatus.defaultListLength > 0 || listLoadStatus.favoriteListLength > 0) {
                setLoadStatus(LoadStatus.success);
            } else {
                setLoadStatus(LoadStatus.fail);
            }

            fallbackTimer.current && clearTimeout(fallbackTimer.current);

            if (listLoadStatus.error != null) {
                console.log({name: listLoadStatus.error.name, networkStatus: listLoadStatus.error.networkStatus});
            }
        }, diff);

    }

    return (
        <View style={[styles.storyListContainer, loadStatus === LoadStatus.fail ? {display: "none"} : null]}>
            <AnimatedStoryList loadStatus={loadStatus} feedId={feedId} onLoadEnd={onLoadEnd}/>
            <StoryListLoader loadStatus={loadStatus}/>
        </View>
    );

}

const styles = StyleSheet.create({
    storyListContainer: {position: "relative", width: "100%", height: 140},
    storyList: {flex: 1, width: "100%", position: "absolute", top: 0, left: 0},
    storyLoader: {width: "100%", height: 140, paddingVertical: 20, paddingLeft: 20, paddingRight: 0, backgroundColor: "transparent", position: "absolute", top: 0, left: 0}

});

const StoryListLoader = ({loadStatus}: {loadStatus: LoadStatus}) => {

    const fadeAnim = useRef(new Animated.Value(1)).current;  // Initial value for opacity: 1

    useEffect(() => {
        if (loadStatus === LoadStatus.success) {
            Animated.timing(
                fadeAnim,
                {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true
                }
            ).start();
        }
    }, [loadStatus]);

    // 20 - paddingLeft, 10 - gap between cards, 100x100 - card size, rx=20 ry=20 - card borderRadius
   return ( <Animated.View  style={{...styles.storyLoader, opacity: fadeAnim}} pointerEvents="none">
        <ContentLoader
            width={windowWidth - 20}
            height={100}
            viewBox={`0 0 ${windowWidth - 20} 100`}
            speed={1}
            backgroundColor="#ffffff"
            foregroundColor="#777777"
        >
            <Rect x="0" y="0" rx="20" ry="20" width="100" height="100"/>
            <Rect x="110" y="0" rx="20" ry="20" width="100" height="100"/>
            <Rect x="220" y="0" rx="20" ry="20" width="100" height="100"/>
            <Rect x="330" y="0" rx="20" ry="20" width="100" height="100"/>

        </ContentLoader>
    </Animated.View>)

};

const AnimatedStoryList = ({loadStatus, feedId, onLoadEnd}: {loadStatus: LoadStatus, feedId: string, onLoadEnd: (listLoadStatus: ListLoadStatus) => void}) => {

    const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

    const fadeAnim = useRef(new Animated.Value(0)).current;  // Initial value for opacity: 0

    useEffect(() => {
        if (loadStatus === LoadStatus.success) {
            Animated.timing(
                fadeAnim,
                {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true
                }
            ).start();
        }
    }, [loadStatus]);

    return (
        <Animated.View style={{...styles.storyList, opacity: fadeAnim}}>
            <StoriesList storyManager={storyManager} appearanceManager={appearanceManager} feed={feedId}
                         onLoadEnd={onLoadEnd}/>
        </Animated.View>
    );
};

```


## StoryManager public methods
```ts
type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string|number>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: Option<string>;
};

type StoryManagerCallbackPayload<T> = {src: 'storiesList' | 'storyReader', data: T};

enum StoriesEvents {
  CLICK_ON_STORY = 'clickOnStoryLink',
};

interface EventPayloadDataNameMap {
  "clickOnStoryLink": {id: number, index: number, url: string};
};

type StoryManagerCallbacks = {
  storyLinkClickHandler: (payload: StoryManagerCallbackPayload<{id: number, index: number, url: string}>) => void;
};

type OnboardingLoadStatus = {
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

interface StoryManager {
  (config: StoryManagerConfig, callbacks?: StoryManagerCallbacks): StoryManager;
  getInstance(): StoryManager; // static
  setTags(tags: Array<string>): void;
  setUserId(userId: string | number): void;
  setLang(lang: string): void;
  setPlaceholders(placeholders: Dict<string>): void;
  showStory(id: number | string, appearanceManager: AppearanceManager): Promise<{loaded: boolean}>;
  closeStoryReader(): void;
  showOnboardingStories(appearanceManager: AppearanceManager, customTags?: Array<string>): Promise<OnboardingLoadStatus>;
  
  // callbaks
  set storyLinkClickHandler(payload: StoryManagerCallbackPayload<{id: number, index: number, url: string}>);
  
  // events
  on<K extends keyof EventPayloadDataNameMap>(event: K, listener: (payload: StoryManagerCallbackPayload<EventPayloadDataNameMap[K]>) => void): StoryManager;
  once<K extends keyof EventPayloadDataNameMap>(event: K, listener: (payload: StoryManagerCallbackPayload<EventPayloadDataNameMap[K]>) => void): StoryManager;

}

```

### StoryReader btnClickHandler example
```js
storyManager.on("clickOnStoryLink", payload => {
   const url = payload.data.url;
   if (url.indexOf('custom-schema://') === 0) {
       // run custom action
   } else {
     window.open(url, '_self');
   }
});

```


### Show single story example

```js

import {StoryReader, useIas} from "packages/react-native-ias/index";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";
import Toast from 'react-native-simple-toast';

const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

// appearance config
appearanceManager.setCommonOptions({
    hasLike: true,
    hasFavorite: true
}).setStoryReaderOptions({
    closeButtonPosition: 'right',
    scrollStyle: 'flat',
});

storyManager.showStory(125, appearanceManager).then(res => {
    console.log({res});
    if (res.loaded === false) {
        Toast.show('Failed to load story');
    }
});

```

### Show onboarding example

```ts

import {StoryReader, useIas} from "packages/react-native-ias/index";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

type OnboardingLoadStatus = {
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


// appearance config
appearanceManager.setCommonOptions({
    hasLike: true,
    hasFavorite: true
}).setStoryReaderOptions({
    closeButtonPosition: 'right',
    scrollStyle: 'flat',
});

storyManager.showOnboardingStories(appearanceManager)
.then((res: OnboardingLoadStatus) => {
    let onboardingOpened = false;
    if (res.success && res.defaultListLength > 0) {
        onboardingOpened = true;
    }
    
    console.log({onboardingOpened});
    
});

```


--- 

## storyManagerConfig

| Variable     | Type                             | Description                                                                           |
|--------------|----------------------------------|---------------------------------------------------------------------------------------|
| apiKey       | string                           | Your project integration key                                                          |
| userId       | string &#124; number &#124; null | User id                                                                               |
| tags         | Array<string>                    | Array of tags                                                                         |
| placeholders | object                           | Dict for replace placeholders inside story content or title. Example: {user: "Guest"} |
| lang         | 'ru' &#124; 'en'                 | User locale                                                                           |

## AppearanceManager - StoriesListOptions

| Variable      | Type   | Description                                                                         |
|---------------|--------|-------------------------------------------------------------------------------------|
| title         | object | [Slider title options](#slider-title-options)                                       |
| card          | object | [Slider card item options](#slider-card-options)                                    |
| favoriteCard  | object | [Slider favorite card additional options](#slider-favorite-card-additional-options) |
| layout        | object | [Slider layout options](#slider-layout-options)                                     |
| sidePadding   | number | Slider side padding, `px`. Default 20                                               |
| topPadding    | number | Slider top padding, `px`. Default 20                                                |
| bottomPadding | number | Slider bottom padding, `px`. Default 20                                             |
| bottomMargin  | number | Slider bottom margin, `px`. Default 17                                              |
| navigation    | object | [Slider navigation options](#slider-navigation-options)                             |

### Slider title options

| Variable     | Type               | Description                                                                                                                                                                                                                                             |
|--------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| content      | string &#124; null | Title text. Default null. Title block hidden when value is empty                                                                                                                                                                                        |
| color        | string             | CSS valid color value. Default `#ffffff`                                                                                                                                                                                                                |
| marginBottom | number             | Title block bottom margin, `px`. Default 20                                                                                                                                                                                                             |
| font         | string             | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `bold 20px/20px InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com). | 

### Slider layout options

| Variable        | Type               | Description                                                                                    |
|-----------------|--------------------|------------------------------------------------------------------------------------------------|
| height          | number &#124; null | Slider total height, `px`. `0` - for auto height. Default `0`                                  |
| backgroundColor | string             | Default `transparent`                                                                          |
| sliderAlign     | string             | Horizontal align slider inside widget, variants: `left`, `center` and `right`. Default `left`. |

### Slider card options

| Variable        | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|-----------------|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| title           | object               | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| title.display   | boolean              | Determines whether to show the title or not                                                                                                                                                                                                                                                                                                                                                                                                                       |
| title.position  | string               | Title position. Variants: `cardInsideBottom` (inside card, at bottom), `cardOutsideTop` (above the card) and `cardOutsideBottom`(under the card). Default - `cardInsideBottom`<br/> Note when using the `cardOutsideTop` or `cardOutsideBottom` option you must manually specify a [Slider layout height](#slider-layout-options) value. Usually this is the height of the card plus card title lineHeight * card title lineClamp + card title vertical padding   |
| title.textAlign | string               | Text in title horizontal align, variants: `left`, `center` and `right`. Default `left`.                                                                                                                                                                                                                                                                                                                                                                           |
| title.lineClamp | number               | Numbers of text lines. Default 3.                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| title.color     | string               | CSS valid color value. Default `#ffffff`                                                                                                                                                                                                                                                                                                                                                                                                                          |
| title.padding   | number &#124; string | Number, `px` eq for all sides. <br/>String - valid css, for customizing each side. Default `15`                                                                                                                                                                                                                                                                                                                                                                   |
| title.font      | string               | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `normal 1rem InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com).                                                                                                                                                                                                              | 
| gap             | number               | Space between cards, `px`. Default `10`                                                                                                                                                                                                                                                                                                                                                                                                                           |
| height          | number               | Card height, `px`. Default `70`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| variant         | string               | Card style, one of `circle`, `quad`, `rectangle`. Default `circle`                                                                                                                                                                                                                                                                                                                                                                                                |
| border          | object               | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| border.radius   | number               | Card border radius, `px`. Default `0`                                                                                                                                                                                                                                                                                                                                                                                                                             |
| border.color    | string               | Card border color, valid css. Default `black`                                                                                                                                                                                                                                                                                                                                                                                                                     |
| border.width    | number               | Card border width, `px`. Default `2`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| border.gap      | number               | Space between card and border, `px`. Default `3`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| boxShadow       | string &#124; null   | Card box-shadow, valid css value. Default `null`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| dropShadow      | string &#124; null   | Card drop-shadow, valid css value. Example - `1px 2px 8px rgba(34, 34, 34, 0.3)`. Default `null`. Since v0.2.0                                                                                                                                                                                                                                                                                                                                                    |
| opacity         | number               | Card opacity. Default `null`                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| mask            | object &#124; null   | Card mask - overlay between card image and title. CSS valid color. Example - `rgba(0,0,0,.3)`. Default `null`                                                                                                                                                                                                                                                                                                                                                     |
| svgMask         | object &#124; null   | [Options](#slider-card-svg-masked-overlay) for card overlay with svg masks. Since v0.2.0                                                                                                                                                                                                                                                                                                                                                                          |
| read            | object &#124; null   | Contain keys: `border`, `boxShadow`, `opacity`, `mask` <br />Apply this values (if current value not null) on card in `read` state. Default all values null                                                                                                                                                                                                                                                                                                       |

### Slider card svg masked overlay
Since v0.2.0

Used for color overlays with a mask

[Demo](https://github.com/inappstory/RNIasDemo)


| Variable    | Type                               | Description                                 |
|-------------|------------------------------------|---------------------------------------------|
| cardMask    | string &#124; null                 | Svg source. Default null.                   |
| overlayMask | Array<OverlayMaskItem> &#124; null | Array of card overlay masks. Default null.  |


type OverlayMaskItem

| Variable   | Type               | Description                                                                                                       |
|------------|--------------------|-------------------------------------------------------------------------------------------------------------------|
| mask       | string &#124; null | Svg source. Default null.                                                                                         |
| background | string &#124; null | CSS color or any [background options](https://developer.mozilla.org/en-US/docs/Web/CSS/background). Default null. |

Note
Svg mask must match the size and shape of the card
The transparent part of the mask will cut out the content below it
svg tag should have width="100%" height="auto" and xmlns="http://www.w3.org/2000/svg" attributes

Example
```js
// Properties are shown only for svg masks
appearanceManager.setStoriesListOptions({
    svgMask: {
        cardMask: `<svg width="100%" height="auto" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M70 140C108.66 140 140 108.66 140 70C140 56.0958 135.946 43.1385 128.956 32.2455C126.219 35.1714 122.323 37 118 37C109.716 37 103 30.2843 103 22C103 17.6772 104.829 13.7814 107.755 11.0441C96.8615 4.05384 83.9042 0 70 0C31.3401 0 0 31.3401 0 70C0 108.66 31.3401 140 70 140Z" fill="#B6B6B6"/>
</svg>`,
        overlayMask: [{
            mask: `<svg width="100%" height="auto" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M128 22C128 27.5228 123.523 32 118 32C112.477 32 108 27.5228 108 22C108 16.4772 112.477 12 118 12C123.523 12 128 16.4772 128 22Z" fill="#B6B6B6"/>
</svg>`,
            background: "#F2473D",
        }]
    }
});
```

### Slider favorite card additional options

| Variable | Type | Description |
|----------|------|-------------|
| title         | object | See below |
| title.content | string | Card title |
| title.color   | string | CSS valid color value. Default `#000000` |
| title.padding | number &#124; string | Number, `px` eq for all sides. <br/>String - valid css, for customizing each side. Default `15` |
| title.font    | string | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `normal 1rem InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com). | 

### Slider navigation options

By default, controls are round buttons with arrow icons at the edges of the slider

| Variable | Type | Description |
|----------|------|-------------|
| showControls            | boolean | Enable slider controls. Default `false` |
| controlsSize            | number |  Button size, `px`. Default `48` |
| controlsBackgroundColor | string | CSS valid color value. Default `#ffffff` |
| controlsColor           | string | CSS valid color value. Default `#000000` |

## AppearanceManager - StoryReaderOptions

| Variable | Type | Description |
|----------|------|-------------|
| closeButtonPosition        | string | Close button position, one of `left`, `right` |
| scrollStyle                | string | Stories viewPager scroll style, one of `flat`, `cover`, `cube` |
| loader.default.color       | string | Default loader primary color. Valid css color |
| loader.default.accentColor | string | Default loader accent color. Valid css color |


## Events

You can subscribe to events after creating the widget instance

```js
import {useIas} from "packages/react-native-ias/index";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager} = useIas(createStoryManager, createAppearanceManager);
storyManager.on('clickOnStory', payload => console.log(payload));
```

| Name                | Payload                                                        | Description                                                         |
|---------------------|----------------------------------------------------------------|---------------------------------------------------------------------|
| clickOnStory        | {id: number, index: number, isDeeplink: boolean, url?: string} | Click on story card from slider list                                |
| clickOnFavoriteCell | {feed: string }                                                | Click on story favorite card from slider list                       |
| showStory           | {id: number }                                                  | Show story (from slider or reader)                                  |
| closeStory          | {id: number }                                                  | Close story (from reader - transition from story or click on close) |
| showSlide           | {id: number, index: number }                                   | Show slide                                                          |
| clickOnButton       | {id: number, index: number, url: string }                      | Click on button with external link                                  |
| likeStory           | {id: number, value: boolean }                                  | Click to set (value=true) or unset (value=false) story like         |
| dislikeStory        | {id: number, value: boolean }                                  | Click to set (value=true) or unset (value=false) story dislike      |
| favoriteStory       | {id: number, value: boolean }                                  | Click to set (value=true) or unset (value=false) story dislike      |
| shareStory          | {id: number }                                                  | Click on story sharing                                              |
| shareStoryWithPath  | {id: number, url: string }                                     | Event after successful creation of the sharing path                 |

