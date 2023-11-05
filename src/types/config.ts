/**
 * yai Project的信息
 */
interface YPIProject {
    /**
     * 名称
     */
    name: string;
    /**
     * id
     */
    id: string;
    /**
     * 
     */
    token: string;

    remoteUrl: string;
}


/**
 * 转换配置
 */
interface TransFormConfigItem {
    /**
     * 白名单
     */
    whiteList: [string | RegExp][];
    /**
     * 类别 分类或者api
     */
    type: "cate" | "api" | "project";
}