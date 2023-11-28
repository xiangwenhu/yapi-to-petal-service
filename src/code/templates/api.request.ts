import { EAPIItem } from "../../types";
import { APINames } from "../NameFactory";
import { genRequestPrefix } from "../util";

function getParamsTypes(type: APINames) {
    const arr = [];
    if (type.hasPathParams) {
        arr.push(`pathParams:${type.reqParamsTypeName}`);
    }
    if (type.hasReqQuery) {
        arr.push(`query: ${type.reqQueryTypeName}`);
    }
    if (type.hasReqBody) {
        arr.push(`data: ${type.reqBodyTypeName}.${type.reqBodyTypeName}`);
    }
    return arr.join(", ");
}

function getAxiosExtraParams(type: APINames) {
    const arr = [];
    // if (type.hasPathParams) {
    //     arr.push(`\t\tparams:query`);
    // }

    if (type.hasReqQuery) {
        arr.push(`\t\tparams:query`);
    }
    if (type.hasReqBody) {
        arr.push(`\t\tdata`);
    }
    return arr.join(",\r\n");
}

export default function generateAPI(eApi: EAPIItem) {
    const { type, api } = eApi;
    const { method, path: url } = api;
    const funParamsTypes = getParamsTypes(type!);
    // const  resType = type?.hasResBody ? `Promise<${type.resBodyTypeName}>`: `Promise<void>`;
    const axiosParams = getAxiosExtraParams(type!);
    let code: string = "";
    const requestPrefix = genRequestPrefix(eApi);
    if (!type!.hasPathParams) {
        code =
            `
/**
 * ${api.title}
 **/
export function ${type?.apiName}(${funParamsTypes}) {
    return ${requestPrefix}({
        url: "${url}",
        method: "${method.toLowerCase()}",
${axiosParams}`.trim() +
            `
    })
}`;
    } else {
        code =
            `
/**
 * ${api.title}
 **/
export function ${type?.apiName}(${funParamsTypes}) {
    const url = pathToUrl("${url}",pathParams);
    return ${requestPrefix}({
        url,
        method: "${method.toLowerCase()}",
${axiosParams}`.trim() +
            `
    })
}`;
    }
    return code;
}
