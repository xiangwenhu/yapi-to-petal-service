import { IConfig } from "./config";
import { APIItem, CateItem } from "./yapi";

export type ProjectInfo = IConfig.YPIProject & {
    cates: CateItem[];
    apiList: APIItem[];
};
