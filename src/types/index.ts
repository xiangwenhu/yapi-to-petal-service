import { APINames } from "../code/NameFactory";
import { IConfig } from "./config";
import { APIItem, CateItem } from "./yapi";

export type EAPIItem = {
    api: APIItem;
    cate: CateItem;
    project: IConfig.YPIProject;
    site: IConfig.SiteItem;
    type?: APINames & {
        docUrl: string;
        serviceFileName?: string;
        typesFileName?: string;
    },
    service?: IConfig.ServiceItem;
    serviceGroup?: ServiceGroup
}

export interface ServiceGroup {
    filePath: string;
    services: IConfig.ServiceItem[];
}

// 自定义request部分
export type RequestFunctionParams = APINames;

export interface RequestFunction<R = any> {
    (paramsObject: RequestFunctionParams): Promise<R>;
}


// 自定义NameFactory部分