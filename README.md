# react-native-ias

SDK for [InAppStory](https://inappstory.com)

## Sample project
[Repository](https://github.com/inappstory/RNIasDemo)

## Migration guide from 0.2.21 to 0.2.22
The signature of storyManager.showOnboardingStories method has changed
0.2.21 version - showOnboardingStories(appearanceManager: AppearanceManager, customTags?: string);
0.2.22 version - showOnboardingStories(appearanceManager: AppearanceManager, options?: {feed?: string, customTags?: string, limit?: Option<number>});




## Installation

Precondition RN 0.64+

```bash
npm install --save react-native-ias react-native-webview@">=11.0.0" react-native-get-random-values@">=1.0.0" react-native-device-info@">=9.0.0" @react-native-async-storage/async-storage@">=1.0.0" react-native-share@">=7.0.0" rn-android-keyboard-adjust@">=2.1.1"
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

```ts
import {
    AppearanceManager,
    StoriesListCardViewVariant,
    StoryManager,
    StoryReaderCloseButtonPosition, StoryReaderSwipeStyle,
    StoryManagerConfig
} from "react-native-ias";

const storyManagerConfig: StoryManagerConfig = {
    apiKey: "{projectToken}",
    userId: "123456",
    tags: [],
    placeholders: {
        user: "Guest"
    },
    lang: "en",
    defaultMuted: true
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
        slideBorderRadius: 5,
    }).setStoryFavoriteReaderOptions({
        title: {
            content: 'Favorite'
        }
    })
};

```

3. Register StoriesList component at Screen with stories

```tsx
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

### Example - StoriesList with testKey

Since v0.2.24
Use the key for seeing Stories with status "Moderation"
The value of the key is stored in the IAS [console](https://console.inappstory.com)

```tsx
import {createAppearanceManager, createStoryManager} from "../StoriesConfig";
import {StoriesList, useIas} from "react-native-ias";

export function StoryListScreen() {
    const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);
    return <StoriesList storyManager={storyManager} appearanceManager={appearanceManager} feed="default" testKey="moderationTestKey" />;
}
```

### Example - component with skeleton loader for StoriesList
```tsx
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


### Example - reload API for StoriesList
Since v0.2.28
A full-fledged example with skeleton animation and PTR - in [the demo project](https://github.com/inappstory/RNIasDemo)
```tsx
import {createAppearanceManager, createStoryManager} from "../StoriesConfig";
import {StoriesList, useIas, StoriesListViewModel} from "react-native-ias";

export function StoryListScreen() {
    const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

    const storiesListViewModel = useRef<StoriesListViewModel>(undefined);
    const viewModelExporter = useCallback(viewModel => (storiesListViewModel.current = viewModel), []);
    
    return (
        <View>
            <StoriesList storyManager={storyManager} appearanceManager={appearanceManager} feed="default" viewModelExporter={viewModelExporter} />
            <View style={{ height: 0 }} />
            <Button
                containerStyle={{
                    padding: 10,
                    height: "auto",
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: 6,
                    backgroundColor: "#0c62f3",
                }}
                style={{ fontSize: 18, color: "white" }}
                onPress={() => storiesListViewModel.current.reload()}>
                Reload StoriesList
            </Button>
        <View/>
    );
}


```

### StoriesList dimensions
By default, (if appearanceManager.storiesListOptions.layout.height === 0) container height is calculated automatically.\
height = storiesListOptions.card.height + storiesListOptions.topPadding + storiesListOptions.bottomPadding\
If storiesListOptions.card.title.position === CARD_OUTSIDE_TOP or storiesListOptions.card.title.position === CARD_OUTSIDE_BOTTOM\
then height += title.verticalPadding (parsed from storiesListOptions.card.title.padding) + storiesListOptions.card.title.lineClamp (3 by default) * title.lineHeight (parsed from storiesListOptions.card.title.font)


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
  getInstance(): StoryManager; // static, throw Error if StoryManager constructor not called
  setTags(tags: Array<string>): void;
  setUserId(userId: string | number | null): void;
  setLang(lang: string): void;
  setPlaceholders(placeholders: Dict<string>): void;
  showStory(id: number | string, appearanceManager: AppearanceManager): Promise<{loaded: boolean}>;
  closeStoryReader(): Promise<void>;
  showOnboardingStories(appearanceManager: AppearanceManager, options?: {feed?: Option<string>, customTags?: Array<string>, limit?: Option<number>}): Promise<OnboardingLoadStatus>;
  
  // callbaks
  set storyLinkClickHandler(payload: StoryManagerCallbackPayload<{id: number, index: number, url: string}>);
  
  // events
  on<K extends keyof EventPayloadDataNameMap>(event: K, listener: (payload: StoryManagerCallbackPayload<EventPayloadDataNameMap[K]>) => void): StoryManager;
  once<K extends keyof EventPayloadDataNameMap>(event: K, listener: (payload: StoryManagerCallbackPayload<EventPayloadDataNameMap[K]>) => void): StoryManager;

  // info
  get sdkVersionName(): string; // since v0.3.1, return "0.3.1"  
  get sdkVersionCode(): number; // since v0.3.1, return 301
  
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

storyManager.showOnboardingStories(appearanceManager, {feed: "specialOnboarding"})
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

| Variable        | Type               | Description                                                                                                   |
|-----------------|--------------------|---------------------------------------------------------------------------------------------------------------|
| height          | number &#124; null | Slider total height, `px`. `0` - for auto height. Default `0`                                                 |
| backgroundColor | string             | Default `transparent`                                                                                         |
| sliderAlign     | string             | Horizontal align slider inside widget, variants: `left`, `center` and `right`. Default `left`. Since v0.2.23. |

### Slider card options

| Variable        | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| title           | object               | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| title.display   | boolean              | Determines whether to show the title or not. Since v0.2.23.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| title.position  | string               | Title position. Variants: `cardInsideBottom` (inside card, at bottom), `cardOutsideTop` (above the card) and `cardOutsideBottom`(under the card). Default - `cardInsideBottom`<br/> Note when using the `cardOutsideTop` or `cardOutsideBottom` option you must manually specify a [Slider layout height](#slider-layout-options) value. Usually this is the height of the card plus card title lineHeight * card title lineClamp + card title vertical padding. Since v0.2.23. |
| title.textAlign | string               | Text in title horizontal align, variants: `left`, `center` and `right`. Default `left`. Since v0.2.23.                                                                                                                                                                                                                                                                                                                                                                          |
| title.lineClamp | number               | Numbers of text lines. Default 3. Since v0.2.23.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| title.color     | string               | CSS valid color value. Default `#ffffff`                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| title.padding   | number &#124; string | Number, `px` eq for all sides. <br/>String - valid css, for customizing each side. Default `15`. Since v0.2.23.                                                                                                                                                                                                                                                                                                                                                                 |
| title.font      | string               | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `normal 1rem InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com).                                                                                                                                                                                                                            | 
| gap             | number               | Space between cards, `px`. Default `10`                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| height          | number               | Card height, `px`. Default `70`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| variant         | string               | Card style, one of `circle`, `quad`, `rectangle`. Default `circle`                                                                                                                                                                                                                                                                                                                                                                                                              |
| border          | object               | See below                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| border.radius   | number               | Card border radius, `px`. Default `0`                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| border.color    | string               | Card border color, valid css. Default `black`                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| border.width    | number               | Card border width, `px`. Default `2`                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| border.gap      | number               | Space between card and border, `px`. Default `3`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| boxShadow       | string &#124; null   | Card box-shadow, valid css value. Default `null`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| dropShadow      | string &#124; null   | Card drop-shadow, valid css value. Example - `1px 2px 8px rgba(34, 34, 34, 0.3)`. Default `null`. Since v0.2.0                                                                                                                                                                                                                                                                                                                                                                  |
| opacity         | number               | Card opacity. Default `null`                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| mask            | object &#124; null   | Card mask - overlay between card image and title. CSS valid color. Example - `rgba(0,0,0,.3)`. Default `null`                                                                                                                                                                                                                                                                                                                                                                   |
| svgMask         | object &#124; null   | [Options](#slider-card-svg-masked-overlay) for card overlay with svg masks. Since v0.2.0                                                                                                                                                                                                                                                                                                                                                                                        |
| read            | object &#124; null   | Contain keys: `border`, `boxShadow`, `opacity`, `mask` <br />Apply this values (if current value not null) on card in `read` state. Default all values null                                                                                                                                                                                                                                                                                                                     |

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

| Variable                   | Type   | Description                                                                  |
|----------------------------|--------|------------------------------------------------------------------------------|
| closeButtonPosition        | string | Close button position, one of `left`, `right`                                |
| scrollStyle                | string | Stories viewPager scroll style, one of `flat`, `cover`, `cube`               |
| loader.default.color       | string | Default loader primary color. Valid css color                                |
| loader.default.accentColor | string | Default loader accent color. Valid css color                                 |
| closeButton                | object | [Overload](#close-button-options) close button svg icon. Since v0.2.25       |
| likeButton                 | object | [Overload](#like-button-options) like button svg icon. Since v0.2.25         |
| dislikeButton              | object | [Overload](#dislike-button-options) dislike button svg icon. Since v0.2.25   |
| favoriteButton             | object | [Overload](#favorite-button-options) favorite button svg icon. Since v0.2.25 |
| muteButton                 | object | [Overload](#mute-button-options) mute button svg icon. Since v0.2.25         |
| shareButton                | object | [Overload](#share-button-options) share button svg icon. Since v0.2.25       |
| slideBorderRadius          | number | Slide border radius, px. Default value - 0. Since v0.3.2                     |

### Close button options

| Variable         | Type   | Description                                                                                                                                                                                                                                                                                                                                                               |
|------------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc           | object | Svg button sources for different states. Button touchable size is 25x25px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                        |
| svgSrc.baseState | string | Svg source. Default `<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.96425 7.4645L0.142822 0.650209L0.649965 0.143066L7.46425 6.9645L14.2857 0.143066L14.7928 0.650209L7.97139 7.4645L14.7928 14.2859L14.2857 14.7931L7.46425 7.97164L0.649965 14.7931L0.142822 14.2859L6.96425 7.4645Z" fill="white"/></svg>` |


### Like button options

| Variable           | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc             | object | Svg button sources for different states. Button touchable size is 50x50px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| svgSrc.baseState   | string | Svg source. Default `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.6527 13.0592C24.4045 13.5792 24.109 13.8392 23.7427 13.851C23.9402 14.0899 24.085 14.3678 24.1681 14.6664C24.2754 14.9702 24.3315 15.2897 24.3336 15.6119C24.3348 15.9936 24.2566 16.3714 24.1041 16.7214C23.9515 17.0713 23.7278 17.3858 23.4472 17.6446C23.6473 18.006 23.7492 18.4135 23.7427 18.8264C23.742 19.2612 23.6408 19.6899 23.4472 20.0792C23.2852 20.4586 23.0029 20.7743 22.6436 20.9773C22.6984 21.2896 22.7261 21.6058 22.7263 21.9228C22.7263 23.8255 21.6509 24.771 19.4763 24.771H17.4318C15.451 24.6867 13.4962 24.2878 11.6409 23.5892L11.1563 23.4001L10.5536 23.1873L9.96267 22.9864L9.31267 22.7973L8.75722 22.691C8.58024 22.6764 8.40238 22.6764 8.2254 22.691H7.68176V11.6764H8.27267C8.46193 11.6776 8.64992 11.6456 8.82813 11.5819C9.05683 11.4341 9.2671 11.2595 9.45449 11.0619C9.69085 10.861 9.90358 10.6483 10.1045 10.4592C10.3422 10.2191 10.5671 9.9666 10.7781 9.7028L11.369 8.98189L11.9009 8.28462L12.2909 7.76462C12.9054 6.99644 13.3427 6.47644 13.5909 6.21644C14.0779 5.68876 14.4234 5.04639 14.5954 4.34917C14.8081 3.5928 14.9854 2.88371 15.1154 2.21008C15.1935 1.67828 15.4185 1.17889 15.7654 0.768253C16.1631 0.714621 16.5679 0.758694 16.9447 0.896661C17.3215 1.03463 17.659 1.26233 17.9281 1.56008C18.3401 2.31941 18.5286 3.17988 18.4718 4.04189C18.4115 4.993 18.1581 5.92186 17.7272 6.77189C17.272 7.61247 16.9944 8.5377 16.9118 9.49008H22.8209C23.3921 9.51353 23.9334 9.75175 24.3365 10.1571C24.7398 10.5625 24.9751 11.1051 24.9954 11.6764C24.9759 12.1558 24.8593 12.6261 24.6527 13.0592Z" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/><path d="M5.90904 11.8184H1.18176V22.4547H5.90904V11.8184Z" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/></svg>`                           |
| svgSrc.activeState | string | Svg source. Default `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.6527 13.0592C24.4045 13.5792 24.109 13.8392 23.7427 13.851C23.9402 14.0899 24.085 14.3678 24.1681 14.6664C24.2754 14.9702 24.3315 15.2897 24.3336 15.6119C24.3348 15.9936 24.2566 16.3714 24.1041 16.7214C23.9515 17.0713 23.7278 17.3858 23.4472 17.6446C23.6473 18.006 23.7492 18.4135 23.7427 18.8264C23.742 19.2612 23.6408 19.6899 23.4472 20.0792C23.2852 20.4586 23.0029 20.7743 22.6436 20.9773C22.6984 21.2896 22.7261 21.6058 22.7263 21.9228C22.7263 23.8255 21.6509 24.771 19.4763 24.771H17.4318C15.451 24.6867 13.4962 24.2878 11.6409 23.5892L11.1563 23.4001L10.5536 23.1873L9.96267 22.9864L9.31267 22.7973L8.75722 22.691C8.58024 22.6764 8.40238 22.6764 8.2254 22.691H7.68176V11.6764H8.27267C8.46193 11.6776 8.64992 11.6456 8.82813 11.5819C9.05683 11.4341 9.2671 11.2595 9.45449 11.0619C9.69085 10.861 9.90358 10.6483 10.1045 10.4592C10.3422 10.2191 10.5671 9.9666 10.7781 9.7028L11.369 8.98189L11.9009 8.28462L12.2909 7.76462C12.9054 6.99644 13.3427 6.47644 13.5909 6.21644C14.0779 5.68876 14.4234 5.04639 14.5954 4.34917C14.8081 3.5928 14.9854 2.88371 15.1154 2.21008C15.1935 1.67828 15.4185 1.17889 15.7654 0.768253C16.1631 0.714621 16.5679 0.758694 16.9447 0.896661C17.3215 1.03463 17.659 1.26233 17.9281 1.56008C18.3401 2.31941 18.5286 3.17988 18.4718 4.04189C18.4115 4.993 18.1581 5.92186 17.7272 6.77189C17.272 7.61247 16.9944 8.5377 16.9118 9.49008H22.8209C23.3921 9.51353 23.9334 9.75175 24.3365 10.1571C24.7398 10.5625 24.9751 11.1051 24.9954 11.6764C24.9759 12.1558 24.8593 12.6261 24.6527 13.0592Z" fill="white" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/><path d="M5.90904 11.8184H1.18176V22.4547H5.90904V11.8184Z" fill="white" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/></svg>` |


### Dislike button options

| Variable           | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
|--------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc             | object | Svg button sources for different states. Button touchable size is 50x50px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| svgSrc.baseState   | string | Svg source. Default `<svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.95728 12.9407C2.20547 12.4207 2.50092 12.1607 2.86728 12.1489C2.67612 11.9058 2.53186 11.6293 2.44183 11.3334C2.34019 11.0282 2.28443 10.7096 2.27637 10.388C2.27385 10.0067 2.35266 9.62916 2.50754 9.28068C2.66242 8.9322 2.88981 8.62075 3.17456 8.36709C2.96718 8.00817 2.86098 7.59974 2.86728 7.18527C2.86805 6.75051 2.96916 6.32181 3.16274 5.93254C3.31795 5.55004 3.59121 5.22709 3.94274 5.01072C3.91641 4.70402 3.91641 4.39561 3.94274 4.0889C3.94274 2.18618 5.01819 1.24072 7.19274 1.24072H9.17819C11.159 1.32494 13.1138 1.72386 14.9691 2.42254L15.4655 2.59981L16.0564 2.81254L16.6591 3.01345L17.2973 3.20254L17.8527 3.3089C18.0297 3.32349 18.2075 3.32349 18.3846 3.3089H18.9282V14.2171H18.3846C18.1756 14.2289 17.9709 14.281 17.7818 14.3707C17.5397 14.497 17.3136 14.6517 17.1082 14.8316L16.4582 15.4344C16.2205 15.6744 15.9956 15.927 15.7846 16.1907L15.1937 16.9116L14.6618 17.6089L14.2718 18.1289C13.6573 18.8971 13.22 19.4171 12.9718 19.6771C12.4848 20.2048 12.1392 20.8471 11.9673 21.5444C11.7546 22.3007 11.5773 23.0098 11.4473 23.6835C11.3757 24.2149 11.1544 24.715 10.8091 25.1253C10.4238 25.1872 10.0292 25.1575 9.65757 25.0384C9.28589 24.9193 8.94755 24.7142 8.67001 24.4398C8.25902 23.6844 8.07052 22.8279 8.12637 21.9698C8.19097 21 8.4566 20.0542 8.90637 19.1926C9.36165 18.3519 9.63922 17.4267 9.72183 16.4744H3.81274C3.5291 16.4711 3.24901 16.4108 2.98914 16.2971C2.72926 16.1834 2.4949 16.0187 2.30001 15.8126C2.08491 15.6264 1.91004 15.3983 1.78609 15.1423C1.66213 14.8862 1.5917 14.6076 1.5791 14.3235C1.6097 13.8416 1.73839 13.371 1.95728 12.9407Z" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/><path d="M25.4282 3.54541H20.7009V14.1818H25.4282V3.54541Z" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/></svg>`                            |
| svgSrc.activeState | string | Svg source. Default `<svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.95728 12.9407C2.20547 12.4207 2.50092 12.1607 2.86728 12.1489C2.67612 11.9058 2.53186 11.6293 2.44183 11.3334C2.34019 11.0282 2.28443 10.7096 2.27637 10.388C2.27385 10.0067 2.35266 9.62916 2.50754 9.28068C2.66242 8.9322 2.88981 8.62075 3.17456 8.36709C2.96718 8.00817 2.86098 7.59974 2.86728 7.18527C2.86805 6.75051 2.96916 6.32181 3.16274 5.93254C3.31795 5.55004 3.59121 5.22709 3.94274 5.01072C3.91641 4.70402 3.91641 4.39561 3.94274 4.0889C3.94274 2.18618 5.01819 1.24072 7.19274 1.24072H9.17819C11.159 1.32494 13.1138 1.72386 14.9691 2.42254L15.4655 2.59981L16.0564 2.81254L16.6591 3.01345L17.2973 3.20254L17.8527 3.3089C18.0297 3.32349 18.2075 3.32349 18.3846 3.3089H18.9282V14.2171H18.3846C18.1756 14.2289 17.9709 14.281 17.7818 14.3707C17.5397 14.497 17.3136 14.6517 17.1082 14.8316L16.4582 15.4344C16.2205 15.6744 15.9956 15.927 15.7846 16.1907L15.1937 16.9116L14.6618 17.6089L14.2718 18.1289C13.6573 18.8971 13.22 19.4171 12.9718 19.6771C12.4848 20.2048 12.1392 20.8471 11.9673 21.5444C11.7546 22.3007 11.5773 23.0098 11.4473 23.6835C11.3757 24.2149 11.1544 24.715 10.8091 25.1253C10.4238 25.1872 10.0292 25.1575 9.65757 25.0384C9.28589 24.9193 8.94755 24.7142 8.67001 24.4398C8.25902 23.6844 8.07052 22.8279 8.12637 21.9698C8.19097 21 8.4566 20.0542 8.90637 19.1926C9.36165 18.3519 9.63922 17.4267 9.72183 16.4744H3.81274C3.5291 16.4711 3.24901 16.4108 2.98914 16.2971C2.72926 16.1834 2.4949 16.0187 2.30001 15.8126C2.08491 15.6264 1.91004 15.3983 1.78609 15.1423C1.66213 14.8862 1.5917 14.6076 1.5791 14.3235C1.6097 13.8416 1.73839 13.371 1.95728 12.9407Z" fill="white" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/><path d="M25.4282 3.54541H20.7009V14.1818H25.4282V3.54541Z" fill="white" stroke="white" stroke-width="1.18182" stroke-miterlimit="10"/></svg>`  |


### Favorite button options

| Variable           | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                          |
|--------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc             | object | Svg button sources for different states. Button touchable size is 50x50px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                                                                                   |
| svgSrc.baseState   | string | Svg source. Default `<svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.66 3.81982H4.81116C4.25887 3.81982 3.81116 4.26754 3.81116 4.81982V21.2171C3.81116 22.062 4.83134 22.4865 5.4307 21.8911L11.24 16.1198L17.0401 21.8888C17.6393 22.4847 18.66 22.0603 18.66 21.2152L18.66 4.81983C18.66 4.26754 18.2123 3.81982 17.66 3.81982Z" stroke="white"/></svg>`              |
| svgSrc.activeState | string | Svg source. Default `<svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.66 3.81982H4.81116C4.25887 3.81982 3.81116 4.26754 3.81116 4.81982V21.2171C3.81116 22.062 4.83134 22.4865 5.4307 21.8911L11.24 16.1198L17.0401 21.8888C17.6393 22.4847 18.66 22.0603 18.66 21.2152L18.66 4.81983C18.66 4.26754 18.2123 3.81982 17.66 3.81982Z" fill="white" stroke="white"/></svg>` |


### Mute button options

| Variable           | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc             | object | Svg button sources for different states. Button touchable size is 50x50px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| svgSrc.baseState   | string | Sound off state. Svg source. Default `<svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.2206 22.3918C14.0256 22.3451 12.4651 21.4429 10.7096 20.3773L7.54973 18.456H5.50554H3.46136L3.2429 18.2693L3.02444 18.0827L3.00883 12.8401C2.98543 7.36426 2.98542 7.35648 3.31312 7.14646C3.43015 7.07646 3.55499 7.16202 4.09334 7.7065C4.69411 8.29764 4.72532 8.34431 4.52246 8.34431H4.3118V12.739V17.1337H5.67719H7.04258V13.8902V10.6389L11.8878 15.4614L16.733 20.2839L16.6939 20.6806C16.5769 21.8707 15.3598 22.7107 14.2206 22.3918Z" fill="white"/><path d="M11.1933 13.3847C5.39627 7.59765 3.89824 6.07312 3.82802 5.83977C3.65637 5.2564 4.24934 4.60303 4.86571 4.7197C5.09198 4.75859 6.23891 5.87088 12.4495 12.0624L19.7602 19.3506V19.7317C19.7602 20.0507 19.7212 20.144 19.4949 20.3696C19.2686 20.5951 19.175 20.634 18.8551 20.634H18.4728L11.1933 13.3847Z" fill="white"/><path d="M12.5196 10.6545L8.35327 6.50095L9.00866 6.11204C9.36756 5.90203 10.6471 5.1242 11.8564 4.40083C13.6587 3.30409 14.1191 3.06297 14.4468 3.0163C15.2894 2.89962 16.2101 3.42077 16.5534 4.21415C16.7172 4.60306 16.7172 4.63417 16.7016 9.70559L16.6782 14.8003L12.5196 10.6545Z" fill="white"/></svg>`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| svgSrc.activeState | string | Sound on state. Svg source. Default `<svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.0512 22.4247C11.886 22.3646 10.1891 21.4561 8.28942 20.3974L4.83549 18.4677H2.59795H0.367918L0.187713 18.28L0 18.0998V12.7687V7.44518L0.232764 7.24996L0.465529 7.05474H2.67304H4.88805L8.13174 5.23767C9.91877 4.24655 11.5556 3.34552 11.7809 3.24041C12.8246 2.75986 14.1311 3.19535 14.6567 4.19399L14.8669 4.59194V12.7612C14.8669 21.8616 14.9044 21.1858 14.3338 21.809C13.8082 22.3796 12.772 22.6575 12.0512 22.4247ZM13.0874 21.0807C13.4478 20.893 13.4328 21.2233 13.4403 12.7762V4.78716L13.215 4.56191C12.8171 4.16395 12.7195 4.2015 9.07031 6.23631L5.78908 8.06839L5.78157 12.7687V17.4616L9.10034 19.3162C12.5242 21.2308 12.6819 21.2984 13.0874 21.0807ZM4.35495 12.7612V8.33119H2.89078H1.42662V12.7612V17.1912H2.89078H4.35495V12.7612Z" fill="white"/><path d="M19.3045 16.5456C18.9516 16.2528 18.9891 15.9975 19.4471 15.4794C20.1304 14.7135 20.4683 13.9552 20.5434 13.0241C20.626 12.018 20.2355 10.9443 19.4847 10.1333C19.0116 9.61525 18.9591 9.36747 19.2519 9.02958C19.4021 8.85689 19.4922 8.81934 19.785 8.81934C20.1304 8.81934 20.1604 8.84187 20.626 9.33743C21.2041 9.96064 21.7222 10.9593 21.8949 11.7852C22.2328 13.3845 21.6321 15.2767 20.4382 16.3879C19.9727 16.8159 19.6724 16.8535 19.3045 16.5456Z" fill="white"/><path d="M17.2246 14.6384C17.0218 14.5558 16.8191 14.278 16.8191 14.0753C16.8191 13.9927 16.9317 13.7599 17.0744 13.5647C17.5174 12.9415 17.5174 12.5285 17.0744 12.0029C16.9317 11.8377 16.8191 11.635 16.8191 11.5599C16.8191 11.0869 17.3071 10.734 17.7577 10.8841C18.0655 10.9817 18.4334 11.3872 18.6512 11.8527C18.8914 12.3859 18.8689 13.1968 18.5986 13.7524C18.2232 14.5108 17.7201 14.8411 17.2246 14.6384Z" fill="white"/></svg>` |


### Share button options

| Variable           | Type   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|--------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| svgSrc             | object | Svg button sources for different states. Button touchable size is 50x50px. You can use the icon up to these sizes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| svgSrc.baseState   | string | Svg source. Default `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.7727 4.84545C14.7727 5.43636 14.8909 6.02727 15.0091 6.5L8.98182 9.92727C8.03636 8.86364 6.61818 8.15455 5.08182 8.15455C2.36364 8.03636 0 10.2818 0 13C0 15.7182 2.24545 17.8455 5.08182 17.8455C6.61818 17.8455 8.03636 17.1364 8.98182 16.0727L15.0091 19.3818C14.7727 19.8545 14.7727 20.4455 14.7727 21.0364C14.7727 23.7545 17.0182 25.8818 19.8545 25.8818C22.6909 25.8818 24.9364 23.6364 24.9364 21.0364C24.9364 18.3182 22.6909 16.0727 19.8545 16.0727C18.3182 16.0727 16.9 16.7818 15.9545 17.8455L9.92727 14.5364C10.0455 14.1818 10.1636 13.5909 10.1636 13C10.1636 12.4091 10.0455 11.8182 9.92727 11.3455L15.9545 8.03636C16.9 9.1 18.3182 9.80909 19.8545 9.80909C22.6909 9.80909 24.9364 7.56364 24.9364 4.84545C24.9364 2.12727 22.6909 0 19.8545 0C17.0182 0 14.7727 2.24545 14.7727 4.84545ZM5.08182 16.1909C3.30909 16.1909 1.77273 14.7727 1.77273 13C1.77273 11.2273 3.30909 9.80909 5.08182 9.80909C6.85455 9.80909 8.39091 11.2273 8.39091 13C8.39091 14.7727 6.97273 16.1909 5.08182 16.1909ZM19.8545 17.8455C21.6273 17.8455 23.1636 19.2636 23.1636 21.0364C23.1636 22.8091 21.6273 24.2273 19.8545 24.2273C18.0818 24.2273 16.5455 22.8091 16.5455 21.0364C16.5455 19.3818 18.0818 17.8455 19.8545 17.8455ZM19.8545 1.77273C21.6273 1.77273 23.1636 3.19091 23.1636 4.96364C23.1636 6.73636 21.6273 8.15455 19.8545 8.15455C18.0818 8.15455 16.5455 6.73636 16.5455 4.96364C16.5455 3.19091 18.0818 1.77273 19.8545 1.77273Z" fill="white"/></svg>` |



## AppearanceManager - Overload StoryReader icons

```ts
import {StoryReader, useIas} from "react-native-ias";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

appearanceManager.setStoryReaderOptions({
    closeButton: {
        svgSrc: {
            baseState: `<svg/>`
        }
    },
    likeButton: {
        svgSrc: {
            baseState: `<svg/>`,
            activeState: `<svg/>`,
        }
    },
    dislikeButton: {
        svgSrc: {
            baseState: `<svg/>`,
            activeState: `<svg/>`,
        }
    },
    favoriteButton: {
        svgSrc: {
            baseState: `<svg/>`,
            activeState: `<svg/>`,
        }
    },
    muteButton: {
        svgSrc: {
            baseState: `<svg/>`,
            activeState: `<svg/>`,
        }
    },
    shareButton: {
        svgSrc: {
            baseState: `<svg/>`,
        }
    },
});

```


## StoryReader - API for sound control
Since v0.2.29

### Turn on / off sound by default

Use StoryManagerConfig.defaultMuted flag (default true) for control this behaviour

Example
```ts
import {
    StoryManager,
    StoryManagerConfig
} from "react-native-ias";

const storyManagerConfig: StoryManagerConfig = {
    apiKey: "{projectToken}",
    userId: "123456",
    tags: [],
    placeholders: {
        user: "Guest"
    },
    lang: "en",
    defaultMuted: true
};

export const createStoryManager = () => new StoryManager(storyManagerConfig);
```

### Turning sound on / off at runtime

```ts
// Setter
storyManager.soundOn = true;

// Getter 
let isSoundOn = storyManager.soundOn;

// Sound on / off changed by user (from StoryReader UI)
storyManager.on("soundOnChangedByUser", ({ value }) => isSoundOn = value)
```

### Full example with sound control API
```tsx

import { NavigationProp, RouteProp, useFocusEffect } from "@react-navigation/native";
import { Alert, BackHandler, SafeAreaView, StatusBar, StyleSheet, useColorScheme, View } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import Button from "react-native-button";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { StoriesListViewModel, useIas } from "react-native-ias";

import { createAppearanceManager, createStoryManager } from "../StoriesConfig";


export function MainScreen({ navigation, route }: { navigation: NavigationProp<any>; route: RouteProp<any> }) {
    useFocusEffect(
        useCallback(() => {
            const backAction = () => {
                Alert.alert("Hold on!", "Are you sure you want to go back?", [
                    {
                        text: "Cancel",
                        onPress: () => null,
                        style: "cancel",
                    },
                    { text: "YES", onPress: () => BackHandler.exitApp() },
                ]);
                return true;
            };

            BackHandler.addEventListener("hardwareBackPress", backAction);
            return () => BackHandler.removeEventListener("hardwareBackPress", backAction);
        }, []),
    );

    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    const { storyManager, appearanceManager } = useIas(createStoryManager, createAppearanceManager);

    // state for button in APP UI
    const [soundOnUI, setSoundOnUI] = useState(storyManager.soundOn);
    // event from SDK
    useFocusEffect(
        useCallback(() => {
            storyManager.on("soundOnChangedByUser", ({ value }) => setSoundOnUI(value));
            return () => storyManager.off("soundOnChangedByUser");
        }, [storyManager]),
    );

    return (
        <SafeAreaView style={[styles.container, backgroundStyle]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            <View style={styles.view}>
                <StoriesList
                    storyManager={storyManager}
                    appearanceManager={appearanceManager}
                    feed="default"
                />
                <View style={{ height: 0 }} />
                <Button
                    containerStyle={styles.buttonContainer}
                    style={styles.button}
                    onPress={() => {
                        // source of truth - SDK
                        storyManager.soundOn = !storyManager.soundOn;
                        setSoundOnUI(storyManager.soundOn);
                    }}>
                    Sound state is {soundOnUI ? "On" : "Off"}
                </Button>
                <View style={{ height: 32 }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    },
    view: {
        marginHorizontal: 20,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    button: { fontSize: 18, color: "white" },
    buttonContainer: {
        padding: 10,
        height: "auto",
        width: "100%",
        overflow: "hidden",
        borderRadius: 6,
        backgroundColor: "#0c62f3",
    }
});
```

## API Limits
UserId max length is 255 (in bytes)
Tags max length is 4000 (in bytes, for comma concatenated string)

If the limits are exceeded, the SDK will issue an error message to the console and will not perform network requests

SDK use below function to calculate string length in bytes

```ts
function byteLength(str: string) {
    // returns the byte length of an utf8 string
    let s = str.length;
    for (let i=str.length-1; i>=0; i--) {
        const code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;
        else if (code > 0x7ff && code <= 0xffff) s+=2;
        if (code >= 0xDC00 && code <= 0xDFFF) i--;
    }
    return s;
}
```


## Events

You can subscribe to events after creating the widget instance

```js
import {useIas} from "packages/react-native-ias/index";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager} = useIas(createStoryManager, createAppearanceManager);
storyManager.on('clickOnStory', payload => console.log(payload));
```

| Name                  | Payload                                                        | Description                                                         |
|-----------------------|----------------------------------------------------------------|---------------------------------------------------------------------|
| clickOnStory          | {id: number, index: number, isDeeplink: boolean, url?: string} | Click on story card from slider list                                |
| clickOnFavoriteCell   | {feed: string}                                                 | Click on story favorite card from slider list                       |
| showStory             | {id: number}                                                   | Show story (from slider or reader)                                  |
| closeStory            | {id: number}                                                   | Close story (from reader - transition from story or click on close) |
| showSlide             | {id: number, index: number}                                    | Show slide                                                          |
| clickOnButton         | {id: number, index: number, url: string}                       | Click on button with external link                                  |
| likeStory             | {id: number, value: boolean}                                   | Click to set (value=true) or unset (value=false) story like         |
| dislikeStory          | {id: number, value: boolean}                                   | Click to set (value=true) or unset (value=false) story dislike      |
| favoriteStory         | {id: number, value: boolean}                                   | Click to set (value=true) or unset (value=false) story dislike      |
| shareStory            | {id: number}                                                   | Click on story sharing                                              |
| shareStoryWithPath    | {id: number, url: string}                                      | Event after successful creation of the sharing path                 |
| changeSoundOnInternal | {value: boolean}                                               | Event after the user turned the sound on or off in the story        |

