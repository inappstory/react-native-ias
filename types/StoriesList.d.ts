import * as React from 'react';
import {AppearanceManager, StoryManager} from "../index";
import {Option} from "./types";
import StoriesListViewModel from "./StoriesListViewModel";


declare type Props = {
    storyManager: StoryManager,
    appearanceManager: AppearanceManager,
    feed?: string,
    onLoadStart?: () => void,
    onLoadEnd?: (listLoadStatus: ListLoadStatus) => void,
    testKey?: string,
    viewModelExporter?: (viewModel: StoriesListViewModel) => void,
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

export default function StoriesList(props: Props): React.ReactElement;
export {};
