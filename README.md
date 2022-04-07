# react-native-ias

SDK for [InAppStory](https://inappstory.com)

## Installation

```bash
npm install --save react-native-ias
cd ios
pod install
```

## Usage

1. Register StoryReader at App root
App entry point
```js
import {StoryReader, useIas} from "react-native-ias";
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
import * as IAS from "react-native-ias";

const storyManagerConfig = {
  apiKey: "{projectToken}",
  userId: "123456",
  tags: [],
  placeholders: {
    user: "Guest"
  },
  lang: "en",
};

export const createStoryManager = () => new IAS.StoryManager(storyManagerConfig);

export const createAppearanceManager = () => {
  return new IAS.AppearanceManager()
    .setCommonOptions({
      hasLike: true,
      hasFavorite: true
    })
    .setStoriesListOptions({
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
        variant: 'quad',
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
      bottomMargin: 17,
      navigation: {
        showControls: false,
        controlsSize: 48,
        controlsBackgroundColor: 'white',
        controlsColor: 'black'
      },
    })
    .setStoryReaderOptions({
      closeButtonPosition: 'right',
      scrollStyle: 'flat',
    }).setStoryFavoriteReaderOptions({
      title: {
        content: 'Favorite'
      }
    })
};

```

3. Register StoriesList component at Screen with stories
```js
import {createAppearanceManager, createStoryManager} from "../StoriesConfig";
import {StoriesList, useIas} from "react-native-ias";

export function StoryListScreen() {
  const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);
  return <StoriesList storyManager={storyManager} appearanceManager={appearanceManager} />;
}

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

interface StoryManager {
  (config: StoryManagerConfig, callbacks?: StoryManagerCallbacks): StoryManager;
  getInstance(): StoryManager; // static
  setTags(tags: Array<string>): void;
  setUserId(userId: string | number): void;
  setLang(lang: string): void;
  setPlaceholders(placeholders: Dict<string>): void;
  showStory(id: number | string, appearanceManager: AppearanceManager): Promise<boolean>;
  closeStoryReader(): void;
  showOnboardingStories(appearanceManager: AppearanceManager, customTags?: Array<string>): Promise<boolean>;
  
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

import {StoryReader, useIas} from "react-native-ias";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager, appearanceManager} = useIas(createStoryManager, createAppearanceManager);

// appearance config
appearanceManager.setCommonOptions({
  hasLike: true,
  hasFavorite: true
})
  .setStoryReaderOptions({
    closeButtonPosition: 'right',
    scrollStyle: 'flat',
  });

storyManager.showStory(125, appearanceManager).then(result => {
  console.log({showStoryResult: result});
});

```


--- 

## storyManagerConfig

| Variable | Type | Description |
|----------|------|-------------|
| apiKey       | string                           | Your project integration key |
| userId       | string &#124; number &#124; null | User id |
| tags         | Array<string> | Array of tags |
| placeholders | object  | Dict for replace placeholders inside story content or title. Example: {user: "Guest"} |
| lang         | 'ru' &#124; 'en' | User locale |

## AppearanceManager - StoriesListOptions

| Variable | Type | Description |
|----------|------|-------------|
| title          | object | [Slider title options](#slider-title-options) |
| card           | object | [Slider card item options](#slider-card-options) |
| favoriteCard   | object | [Slider favorite card additional options](#slider-favorite-card-additional-options) |
| layout         | object | [Slider layout options](#slider-layout-options) |
| sidePadding    | number | Slider side padding, `px`. Default 20 |
| topPadding     | number | Slider top padding, `px`. Default 20 |
| bottomPadding  | number | Slider bottom padding, `px`. Default 20 |
| bottomMargin   | number | Slider bottom margin, `px`. Default 17 |
| navigation     | object | [Slider navigation options](#slider-navigation-options) |

### Slider title options

| Variable | Type | Description |
|----------|------|-------------|
| content         | string &#124; null | Title text. Default null. Title block hidden when value is empty |
| color           | string | CSS valid color value. Default `#ffffff` |
| marginBottom    | number | Title block bottom margin, `px`. Default 20 |
| font            | string | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `bold 20px/20px InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com). | 

### Slider layout options

| Variable | Type | Description |
|----------|------|-------------|
| height          | number &#124; null | Slider total height, `px`. `0` - for auto height. Default `0` |
| backgroundColor | string | Default `transparent` |
| sliderAlign     | string | Horizontal align slider inside widget, variants: `left`, `center` and `right`. Default `left`. |

### Slider card options

| Variable | Type | Description |
|----------|------|-------------|
| title           | object | See below |
| title.display   | boolean | Determines whether to show the title or not |
| title.position  | string | Title position. Variants: `cardInsideBottom` (inside card, at bottom), `cardOutsideTop` (above the card) and `cardOutsideBottom`(under the card). Default - `cardInsideBottom`<br/> Note when using the `cardOutsideTop` or `cardOutsideBottom` option you must manually specify a [Slider layout height](#slider-layout-options) value. Usually this is the height of the card plus card title lineHeight * card title lineClamp + card title vertical padding |
| title.textAlign | string | Text in title horizontal align, variants: `left`, `center` and `right`. Default `left`. |
| title.lineClamp | number | Numbers of text lines. Default 3. |
| title.color     | string | CSS valid color value. Default `#ffffff` |
| title.padding   | number &#124; string | Number, `px` eq for all sides. <br/>String - valid css, for customizing each side. Default `15` |
| title.font      | string | CSS valid font [value](https://developer.mozilla.org/en-US/docs/Web/CSS/font). Override font. <br/>Default `normal 1rem InternalPrimaryFont` where InternalPrimaryFont - primary font, loaded in [project settings](https://console.inappstory.com). | 
| gap             | number | Space between cards, `px`. Default `10` |
| height          | number | Card height, `px`. Default `70` |
| variant         | string | Card style, one of `circle`, `quad`, `rectangle`. Default `circle` |
| border          | object | See below |
| border.radius   | number | Card border radius, `px`. Default `0` |
| border.color    | string | Card border color, valid css. Default `black` |
| border.width    | number | Card border width, `px`. Default `2` |
| border.gap      | number | Space between card and border, `px`. Default `3` |
| boxShadow       | string &#124; null | Card box-shadow, valid css value. Default `null` |
| opacity         | number | Card opacity. Default `null` |
| mask            | object &#124; null | Card mask - CSS valid color. Example - `rgba(0,0,0,.3)`. Default `null` |
| read            | object &#124; null | Contain keys: `border`, `boxShadow`, `opacity`, `mask` <br />Apply this values (if current value not null) on card in `read` state. Default all values null |

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
import {useIas} from "react-native-ias";
import {createAppearanceManager, createStoryManager} from "./StoriesConfig";

const {storyManager} = useIas(createStoryManager, createAppearanceManager);
storyManager.on('clickOnStory', payload => console.log(payload));
```

| Name | Payload | Description |
|----------|------|-------------|
| clickOnStory       | {id: number, index: number, isDeeplink: boolean, url?: string} | Click on story card from slider list |
| showStory          | {id: number } | Show story (from slider or reader) |
| closeStory         | {id: number } | Close story (from reader - transition from story or click on close) |
| showSlide          | {id: number, index: number } | Show slide |
| clickOnButton      | {id: number, index: number, url: string } | Click on button with external link |
| likeStory          | {id: number, value: boolean } | Click to set (value=true) or unset (value=false) story like |
| dislikeStory       | {id: number, value: boolean } | Click to set (value=true) or unset (value=false) story dislike |
| favoriteStory      | {id: number, value: boolean } | Click to set (value=true) or unset (value=false) story dislike |
| shareStory         | {id: number } | Click on story sharing |
| shareStoryWithPath | {id: number, url: string } | Event after successful creation of the sharing path |

