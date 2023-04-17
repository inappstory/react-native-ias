import { Option } from "./types";
import { ListLoadStatus } from "./StoriesList";

declare class StoriesListViewModel {

    get feedSlug(): string;

    get testKey(): Option<string>;

    get listLoadStatus(): ListLoadStatus;

    get containerOptions(): Record<any, any>;

    get viewOptions(): Record<any, any>;

    reload(): Promise<ListLoadStatus>;

}

export default StoriesListViewModel;
export {};