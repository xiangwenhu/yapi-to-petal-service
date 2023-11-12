import _ from "lodash";
import { firstToUpper, serverToCommonStr } from "../util";
import { EAPIItem } from "./../types/index";

interface IsExistHandler {
    (name: string): boolean;
}

interface APINameDetail {
    eApi: EAPIItem;
    names: APINames
}

export interface APINames {
    apiName: string;
    reqQueryTypeName: string | undefined;
    reqBodyTypeName: string | undefined;
    reqParamsTypeName: string | undefined;
    resBodyTypeName: string | undefined;

    hasReqQuery: boolean;
    hasReqBody: boolean;
    hasResBody: boolean;
    hasPathParams: boolean;
}

interface NameOnlyHandler {
    (params: { eApi: EAPIItem; isExist: IsExistHandler }): string;
}

interface NameHandler {
    (params: { eApi: EAPIItem; isExist: IsExistHandler }): APINameDetail;
}


export function urlToName(strArr: string[]) {
    return strArr.map((str, index) => {
        return str.startsWith(":") ? undefined : firstToUpper(str)
    }).filter(Boolean).join("");
}

function getMethodNameFromUrl(url: string) {
    return url.split("/").filter(u => u.trim().length > 0 && !u.startsWith(":")).reverse()[0];
} 0


const getBaseName: NameOnlyHandler = ({ eApi, isExist }) => {
    let apiName: string, methodName: string;
    // TODO:: 改良
    // 路径参数  /test1/:id/:name
    const pathStr = eApi.api.path.trim();
    methodName = getMethodNameFromUrl(pathStr);
    if (!isExist(methodName)) {
        return methodName;
    }
    // /api/getName => apiGetName
    apiName = urlToName(pathStr.split("/"));
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
const NO_BODY_METHODS = ['GET', 'OPTIONS'];
function getHasReqBody(eApi: EAPIItem) {
    const { api } = eApi;
    if (NO_BODY_METHODS.includes(eApi.api.method)) {
        return false;
    }
    const reqBodyOther = _.isString(api.req_body_other) ? api.req_body_other.trim() : undefined;
    switch (api.req_body_type) {
        case "form":
            return Array.isArray(api.req_body_form) && api.req_body_form.length > 0;
        case "json":
            return _.isString(reqBodyOther) && reqBodyOther.length > 0
        case "raw":
        case "file":
            return _.isString(reqBodyOther) && reqBodyOther.length > 0
        default:
            return false;
    }
}

const defaultNameHandler: NameHandler = function ({ eApi, isExist }) {
    const name = getBaseName({ eApi, isExist });
    const { api } = eApi;

    const hasReqQuery =
        Array.isArray(api.req_query) && api.req_query.length > 0;
    //
    const hasReqBody = getHasReqBody(eApi); // Array.isArray()
    const hasResBody =
        _.isString(api.res_body) && api.res_body.trim().length > 0;

    const hasReqParams = Array.isArray(api.req_params) && api.req_params.length > 0;

    const fBaseName = firstToUpper(name);

    return {
        names: {
            apiName: name,
            hasPathParams: hasReqParams,
            hasReqQuery,
            hasReqBody,
            hasResBody,
            reqParamsTypeName: hasReqParams ? `Req${fBaseName}Params` : undefined,
            reqBodyTypeName: hasReqBody ? `Req${fBaseName}Body` : undefined,
            reqQueryTypeName: hasReqQuery ? `Req${fBaseName}Query` : undefined,
            resBodyTypeName: hasResBody ? `Res${fBaseName}Body` : undefined,

        },
        eApi
    };
};

class NamesFactory {
    #usedNames: Map<string, APINameDetail> = new Map();

    #names: APINameDetail[] = [];

    constructor(public apis: EAPIItem[]) { }

    gen(nameHandler: NameHandler = defaultNameHandler) {
        this.#usedNames.clear();
        const { isExist } = this;
        this.apis.forEach((eApi) => {
            const detail = nameHandler({ eApi, isExist });
            this.#usedNames.set(detail.names.apiName, detail);
        });
        this.#names = Array.from(this.#usedNames.values());
    }

    isExist = (name: string) => {
        return this.#usedNames.has(name);
    };

    getName(eApi: EAPIItem) {
        let item = this.#names.find((item) => item.eApi === eApi);
        if (item) {
            return item.names;
        }
        item = this.#names.find(
            (item) =>
                item.eApi.site === eApi.site &&
                item.eApi.project.id === eApi.project.id &&
                item.eApi.api._id == eApi.api._id
        );
        if (item) {
            return item.names;
        }
        throw new Error(
            `未能找到对应的name, ${eApi.api.path},  ${eApi.site}, ${eApi.project.id}, ${eApi.api._id}`
        );
    }
}

export default NamesFactory;
