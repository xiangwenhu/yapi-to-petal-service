import { serverToCommonStr, strArrayToBeaut } from '../util';
import { EAPIItem } from './../types/index';

interface IsExistHandler {
    (name: string): boolean;
}

export interface NameHandler {
    (params: { item: EAPIItem, isExist: IsExistHandler }): string;
}

const defaultNameHandler: NameHandler = function ({ item, isExist }) {
    let apiName: string, methodName: string;
    const pathStr = item.api.path.trim();
    methodName = !pathStr.includes("/") ? pathStr : pathStr.split("/").pop()!;
    if (!isExist(methodName)) {
        return methodName
    }
    // /api/getName => apiGetName
    apiName = strArrayToBeaut(pathStr.split("/"));
    if (!isExist(apiName)) {
        return apiName
    }
    // /api/getName => apiGetName_www_api_com_8080
    apiName = `${apiName}_${serverToCommonStr(item.site.server)}`
    if (!isExist(apiName)) {
        return apiName
    }
    // /api/getName => apiGetName_www_api_com_8080_pid
    apiName = `${apiName}_${item.project.id}`;
    if (!isExist(apiName)) {
        return apiName
    }
    // /api/getName => apiGetName_www_api_com_8080_pid_itemId
    apiName = `${apiName}_${item.api._id}`;
    if (!isExist(apiName)) {
        return apiName
    }
    throw new Error(`wow!, crate api name failed`);
}



class NamesFactory {

    #usedNames: Map<string, EAPIItem> = new Map();

    constructor(public apis: EAPIItem[]) { }

    gen(nameHandler: NameHandler = defaultNameHandler,) {
        this.#usedNames.clear();
        const { isExist } = this;
        this.apis.forEach(item => {
            const apiName = nameHandler({ item, isExist });
            this.#usedNames.set(apiName, item);
        })
    }

    isExist = (name: string) => {
        return this.#usedNames.has(name);
    }

}

export default NamesFactory;