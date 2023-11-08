export interface IConfig {
    defaultExport: string;
    targetFolder: string;
    projects: IConfig.YPIProject[];
    items: IConfig.TransConfigItem[];
}

export namespace IConfig {
    /**
     * yai Project的信息
     */
    export interface YPIProject {
        /**
         * 名称
         */
        name: string;
        /**
         * id
         */
        id: string;
        /**
         * 地址
         */
        remoteUrl: string;
        /**
         * 是否启用
         */
        enabled: boolean;
        /**
         * 
         */
        projectId: number;
        /**
         * 
         */
        server: string;
    }

    /**
     * 转换配置
     */
    export interface TransConfigItem {
        serverId: string;
        /**
         * 白名单
         */
        whiteList?: [string | RegExp][];
        /**
         * 类别 分类或者api
         */
        type: "cate" | "api" | "project";
        /**
         * id的值
         */
        id: number;
        /**
         * 目标目录
         */
        fileName: string;
        /**
         * 生成class名字
         */
        className?: string;
    }

}
