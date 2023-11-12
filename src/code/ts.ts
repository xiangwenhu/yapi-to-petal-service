import { EAPIItem } from "../types";
import generateReqBodyType from "./templates/type.req.body";
import generateReqParamsType from "./templates/type.req.params";
import generateReqQueryType from "./templates/type.req.query";
import generateResBodyType from "./templates/type.res.body";

export async function genTypeScript(list: EAPIItem[]) {
    const results: string[] = [];
    for (let i = 0; i < list.length; i++) {
        const eApi = list[i];
        const type = eApi.type!;

        if (type.hasPathParams) {
            const reqParamsType = generateReqParamsType(eApi);
            results.push(reqParamsType);
        }
        if (type.hasReqQuery) {
            const reqQueryType = generateReqQueryType(eApi);
            results.push(reqQueryType);
        }
        if (type.hasReqBody) {
            const reqBodyType = await generateReqBodyType(eApi);
            results.push(reqBodyType?.code || "");
        }
        if (type.hasResBody) {
            const resBodyType = await generateResBodyType(eApi);
            results.push(resBodyType?.code || "");
        }
    }
    return results.filter(Boolean).join("\r\n");
}
