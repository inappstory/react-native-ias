import {Option} from "./types";
import EventEmitter from "./EventEmitter";

export declare type StoryManagerConfig = {
  apiKey: string;
  userId?: Option<string|number>;
  tags?: Option<Array<string>>;
  placeholders?: Option<Dict<string>>;
  lang?: string;
};

declare class StoryManager extends EventEmitter {
  constructor(config: StoryManagerConfig);
}

export default StoryManager;
export {};
