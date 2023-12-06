import { EAPIItem } from "../../types";
import { createOneParamFunction } from "../../util/function";

export function getFullApiDocUrl(params: {
    server: string;
    projectId: number;
    apiId: number;
}) {
    return `${params.server}/project/${params.projectId}/interface/api/${params.apiId}`;
}

export function replaceRequestPrefix(value: string, paramObject: Record<string, any>) {
    const rValue = value.replace(/\$\{/gim, "\\${");
    return createOneParamFunction("return \\`" + rValue + "\\`", ['R', 'method'])(
        paramObject
    );
}

export function genRequestPrefix(eApi: EAPIItem) {
    const resType = eApi.type?.hasResBody ? `${eApi.type.resBodyTypeName}.${eApi.type.resBodyTypeName}` : `void`;
    const result = replaceRequestPrefix(eApi.service?.requestPrefix || 'axios<${R}>', {
        R: resType,
        method: eApi.api.method.toLocaleLowerCase(),
    })
    return result
}

export function fixTypesFilePath(relativePath: string) {
    let fp = relativePath;
    if (fp.endsWith(".ts")) {
        fp = fp.slice(0, -3);
    }
    fp = fp.replace(/\\/img, "/");
    if (!fp.startsWith(".") || !fp.startsWith("/")) {
        return `./${fp}`
    }
    return fp;
}