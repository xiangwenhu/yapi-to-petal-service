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

export default function generateApiHeader(eApiList: EAPIItem[]) {
    const typesStr = eApiList
        .map((eApi) => `${getParamsTypes(eApi.type!)}`)
        .join(", ");
    // .types.ts 和 service.ts的相对路径问题
    // const rPath =
    const importTypesStr = `import { ${typesStr} } from "./test.types"`;
    const code = `import axios from "axios";
${importTypesStr}
`;
    return code;
}
