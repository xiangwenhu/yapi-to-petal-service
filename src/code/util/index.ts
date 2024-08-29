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
    const resType = eApi.type?.hasResBody ? `${eApi.type.resBodyTypeName}` : `void`;
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


const REGEX_TS_KV = /(\w+\?{0,1}): (\w+(\[\]){0,1});/g;
function replaceTypeName(content: string, replacer: (typeName: string) => string) {

    let match;
    while ((match = REGEX_TS_KV.exec(content)) !== null) {
        const modifiedType = replacer(match[2]); // 假设你有一个名为 modifyType 的函数来修改类型
        const replacement = `${match[1]}: ${modifiedType};`;
        content = content.replace(match[0], replacement);
    }
    return content
}


const BUILT_IN_TYPES = ['number', 'string', 'boolean', 'object', 'null'];

const SPLIT_STR = `export interface`;
export function generateNamespace(typesStr: string, namespaceName: string): string {

    const lines = typesStr.split(/\r{0,1}\n/);

    // export type YDataItem = string
    const typeLines = [];
    const otherLines = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith("export type")) {
            typeLines.push(line);
        } else {
            otherLines.push(line);
        }
    }


    const arr = otherLines.join("\r\n").split(SPLIT_STR);
    if (arr.length == 2 && typeLines.length === 0) {
        return typesStr;
    }

    const basePart = arr.slice(0, 2).join(SPLIT_STR);
    const rBasePart = replaceTypeName(basePart, typeName => {
        if (BUILT_IN_TYPES.includes(typeName)) {
            return typeName
        }
        return `${namespaceName}.${typeName}`
    })

    const nsArr = arr.slice(2);
    const namespacePart = nsArr.length > 0 ? `${SPLIT_STR}` + nsArr.join(SPLIT_STR) : "";

    return `
${rBasePart}

export namespace ${namespaceName}{
${typeLines.join("\r\n")}
${namespacePart}
}
  `
}