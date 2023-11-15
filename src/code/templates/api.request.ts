import { EAPIItem } from "../../types";
import { APINames } from "../NameFactory";


function getParamsTypes(type: APINames) {
    const arr = [];
    if (type.hasPathParams) {
        arr.push(`pathParams:${type.reqParamsTypeName}`);
    }
    if (type.hasReqQuery) {
        arr.push(`query: ${type.reqQueryTypeName}`);
    }
    if (type.hasReqBody) {
        arr.push(`data: ${type.reqBodyTypeName}`);
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
    const resType = type?.hasResBody ? `${type.resBodyTypeName}` : `void`;
    const axiosParams = getAxiosExtraParams(type!);
    let code: string = "";
    if (!type!.hasPathParams) {
        code =
            `
/**
 * ${api.title}
 **/
export function ${type?.apiName}(${funParamsTypes}) {
    return axios<${resType}>({
        url: "${url}",
        method: "${method}",
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
    return axios<${resType}>({
        url,
        method: "${method}",
${axiosParams}`.trim() +
            `
    })
}`;
    }
    return code;
}
