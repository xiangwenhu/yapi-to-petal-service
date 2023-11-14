import { EAPIItem } from "../../types";
import { APINames } from "../NameFactory";

function getParamsTypes(type: APINames) {
    const arr = [];
    if (type.hasReqQuery) {
        arr.push(type.reqQueryTypeName);
    }
    if (type.hasReqBody) {
        arr.push(type.reqBodyTypeName);
    }
    if (type.hasResBody) {
        arr.push(type.resBodyTypeName);
    }
    return arr.join(", ");
}

function fixTypesFilePath(relativePath: string) {
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

export default function generateApiHeader(eApiList: EAPIItem[], relativePath: string) {
    const fPath = fixTypesFilePath(relativePath);
    const typesStr = eApiList
        .map((eApi) => `${getParamsTypes(eApi.type!)}`)
        .join(", ");
    // .types.ts 和 service.ts的相对路径问题
    // const rPath =
    const importTypesStr = `import { ${typesStr} } from "${fPath}"`;
    const code = `${importTypesStr}
`.trim();
    return code;
}
