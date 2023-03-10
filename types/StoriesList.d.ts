import * as React from 'react';
import {AppearanceManager, StoryManager} from "../index";
import {Option} from "./types";


declare type Props = {
    storyManager: StoryManager,
    appearanceManager: AppearanceManager,
    feed?: string,
    onLoadEnd?: (listLoadStatus: ListLoadStatus) => void,
    testKey?: string,
};

export type ListLoadStatus = {
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

export default function StoriesList({storyManager, appearanceManager}: Props): React.ReactElement;
export {};
