import { APIItem } from "./yapi";

export interface IConfig {
    /**
     * services 所在的目录
     */
    serviceFolder: string;
    /**
     * types所在的目录
     */
    typesFolder: string;
    sites: IConfig.SiteItem[]
}

export namespace IConfig {

    /**
     * yai Project的信息
     */
    export interface YPIProject {
        /**
         * 名称
         */
        name?: string;
        /**
         * id + token, remoteUrl 二选一
         */
        id?: number;
        /**id + token, remoteUrl 二选一
         * 
         */
        token?: string;
        /**
         * 地址, id + token, remoteUrl 二选一
         */
        remoteUrl?: string;
        /**
         * 是否禁用
         */
        disabled: boolean;
    }

    /**
     * 转换配置
     */
    export interface ServiceItem {
        whiteList?: [string | RegExp][];
        /**
         * 类别 分类或者api
         */
        type: "cate" | "api" | "project";
        /**
         * 目标目录
         */
        fileName: string;
        /**
         * 生成class名字
         */
        className?: string;
        /**
         * 根据type不同，值不同
         */
        items: number[];
        serviceFolder?: string;
        typesFolder?: string;
        /**
         * service File 相对于 types File的路径
         */
        relativePath?: string;
    }

    export interface SiteItem {
        server: string;
        serviceFolder?: string;
        typesFolder?: string;
        projects: IConfig.YPIProject[];
        services: IConfig.ServiceItem[];
        apis: APIItem[]
    }

}
