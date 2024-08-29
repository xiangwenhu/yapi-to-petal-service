import { EAPIItem } from "../../types";
import { APINames } from "../NameFactory";
import { fixTypesFilePath } from "../util";

function getParamsTypes(type: APINames) {
    const arr = [];
    if(type.hasPathParams){
        arr.push(type.reqParamsTypeName);
    }
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
