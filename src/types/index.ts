import { IConfig } from "./config";
import { APIItem, CateItem } from "./yapi";


export type EAPIItem = {
    api: APIItem;
    cate: CateItem;
    project: IConfig.YPIProject;
    site: IConfig.SiteItem;
}

