import _ from "lodash";
import { firstToUpper, serverToCommonStr, strArrayToBeaut } from "../util";
import { EAPIItem } from "./../types/index";

interface IsExistHandler {
    (name: string): boolean;
}

interface APINameDetail {
    name: string;
    eApi: EAPIItem;
    reqQueryTypeName?: string;
    reqBodyName?: string;
    resBodyName?: string;
    hasReqQuery?: boolean;
    hasReqBody?: boolean;
    hasResBody?: boolean;
}

interface NameOnlyHandler {
    (params: { eApi: EAPIItem; isExist: IsExistHandler }): string;
}

interface NameHandler {
    (params: { eApi: EAPIItem; isExist: IsExistHandler }): APINameDetail;
}

const getBaseName: NameOnlyHandler = ({ eApi, isExist }) => {
    let apiName: string, methodName: string;
    const pathStr = eApi.api.path.trim();
    methodName = !pathStr.includes("/") ? pathStr : pathStr.split("/").pop()!;
    if (!isExist(methodName)) {
        return methodName;
    }
    // /api/getName => apiGetName
    apiName = strArrayToBeaut(pathStr.split("/"));
    if (!isExist(apiName)) {
        return apiName;
    }
    // /api/getName => apiGetName_www_api_com_8080
    apiName = `${apiName}_${serverToCommonStr(eApi.site.server)}`;
    if (!isExist(apiName)) {
        return apiName;
    }
    // /api/getName => apiGetName_www_api_com_8080_pid
    apiName = `${apiName}_${eApi.project.id}`;
    if (!isExist(apiName)) {
        return apiName;
    }
    // /api/getName => apiGetName_www_api_com_8080_pid_itemId
    apiName = `${apiName}_${eApi.api._id}`;
    if (!isExist(apiName)) {
        return apiName;
    }
    throw new Error(`wow!, crate api name failed`);
};

// TODO::
function hasReqBody(eApi: EAPIItem){

    return false;
}

const defaultNameHandler: NameHandler = function ({ eApi, isExist }) {
    const name = getBaseName({ eApi, isExist });
    const { api } = eApi;

    const hasReqQuery =
        Array.isArray(api.req_query) && api.req_query.length > 0;
    //
    const hasReqBody = false; // Array.isArray()
    const hasResBody =
        _.isString(api.res_body) && api.res_body.trim().length > 0;

    const fBaseName = firstToUpper(name);

    return {
        name,
        hasResBody,
        hasReqQuery,
        hasReqBody: true,
        reqBodyName: hasReqBody ? `req${fBaseName}Body` : undefined,
        reqQueryTypeName: hasReqQuery ? `req${fBaseName}Query` : undefined,
        resBodyName: hasResBody ? `res${fBaseName}Body` : undefined,
        eApi
    };
};

class NamesFactory {
    #usedNames: Map<string, APINameDetail> = new Map();

    #names: APINameDetail[] = [];

    constructor(public apis: EAPIItem[]) {}

    gen(nameHandler: NameHandler = defaultNameHandler) {
        this.#usedNames.clear();
        const { isExist } = this;
        this.apis.forEach((eApi) => {
            const detail = nameHandler({ eApi, isExist });
            this.#usedNames.set(detail.name, detail);
        });
        this.#names = Array.from(this.#usedNames.values());
    }

    isExist = (name: string) => {
        return this.#usedNames.has(name);
    };

    getName(eApi: EAPIItem) {
        let item = this.#names.find((item) => item.eApi === eApi);
        if (item) {
            return item.name;
        }
        item = this.#names.find(
            (item) =>
                item.eApi.site === eApi.site &&
                item.eApi.project.id === eApi.project.id &&
                item.eApi.api._id == eApi.api._id
        );
        if (item) {
            return item.name;
        }
        throw new Error(
            `未能找到对应的name, ${eApi.api.path},  ${eApi.site}, ${eApi.project.id}, ${eApi.api._id}`
        );
    }
}

export default NamesFactory;
