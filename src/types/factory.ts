import { APINames, NameHandler } from "../code/NameFactory";

export interface FactoryHandlerParams {
    /**
     * service 最终目录
     */
    filePath: string;
    /**
     * 获取相对路径
     * @param sourcePath
     */
    getImportPath(sourcePath: string): string;
}

export interface FactoryOptions {
    types?: {
        beforeImports?(params: FactoryHandlerParams): string | string[];
        afterImport?(params: FactoryHandlerParams): string | string[];
        footer?(params: FactoryHandlerParams): string;        
    };

    api?: {
        /**
         * 请求
         * @param names
         */
        request?(names: APINames): string;

        beforeImports?(params: FactoryHandlerParams): string | string[];
        afterImport?(params: FactoryHandlerParams): string | string[];
        footer?(params: FactoryHandlerParams): string;   
    };

    /**
     * 名字
     */
    nameHandler?: NameHandler;
}
