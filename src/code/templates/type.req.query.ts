import { EAPIItem } from "../../types";

export default function generateReqQueryType(eApi: EAPIItem) {
    const { api, type } = eApi;
    const req_query = api.req_query;
    if (!Array.isArray(req_query) || req_query.length === 0) {
        return "";
    }

    const fCodes = req_query.map(
        (item) =>
            `   /**
     * ${item.desc || ""}
     */
    ${item.name}${item.required == "1" ? "" : "?"}: string;`
    );

    const code = `
/**
 * ${api.title}请求Query参数
 * path: ${api.path}
 * doc url: ${type?.docUrl}
 */
export interface ${type?.reqQueryTypeName} {
    ${fCodes.join("\r\n")}
    [k: string]: unknown;
}`.trim();

    return code;
}
