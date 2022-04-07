import * as React from 'react';
import {AppearanceManager, StoryManager} from "../index";


declare type Props = {
  storyManager: StoryManager,
  appearanceManager: AppearanceManager
};

export default function StoriesList({storyManager, appearanceManager}: Props): React.ReactElement;
export {};
