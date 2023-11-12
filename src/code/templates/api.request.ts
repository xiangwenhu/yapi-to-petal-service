import { EAPIItem } from "../../types";
import { APINames } from "../NameFactory";

function getParamsTypes(type: APINames) {
    const arr = [];
    // if (type.hasPathParams) {
    //     arr.push(`pathParams:${type.reqParamsTypeName}`);
    // }
    if (type.hasReqQuery) {
        arr.push(`query:${type.reqQueryTypeName}`);
    }
    if (type.hasReqBody) {
        arr.push(`data:${type.reqBodyTypeName}`);
    }
    return arr.join(",\r\n");
}

function getAxiosExtraParams(type: APINames) {
    const arr = [];
    if (type.hasReqQuery) {
        arr.push(`params:query`);
    }
    if (type.hasReqBody) {
        arr.push(`data`);
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
    const code = `
export function ${type?.apiName}(${funParamsTypes}) {
    return axios<${resType}>({
        url: "${url}",
        method: "${method}",
        ${axiosParams}
    })
}  
`;
    return code;
}
