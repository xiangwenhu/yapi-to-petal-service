import { IConfig } from "./config";
import { CateItem } from "./yapi";

export type ProjectInfo = IConfig.YPIProject & {
    cates: CateItem[];
};
