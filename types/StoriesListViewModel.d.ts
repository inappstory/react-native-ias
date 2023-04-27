import { Option } from "./types";
import { ListLoadStatus } from "./StoriesList";

export type StoriesListDimensions = {
    totalHeight: number;
}

declare class StoriesListViewModel {

    get feedSlug(): string;

    get testKey(): Option<string>;

    get listLoadStatus(): ListLoadStatus;

    get containerOptions(): Record<any, any>;

    get viewOptions(): Record<any, any>;

    reload(): Promise<ListLoadStatus>;

    // get storiesListDimensions(): StoriesListDimensions;

}

export default StoriesListViewModel;
export {};