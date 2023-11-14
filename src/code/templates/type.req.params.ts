import { EAPIItem } from "../../types";

export default function generateReqParamsType(eApi: EAPIItem) {
    const { api, type } = eApi;

    const fCodes = api.req_params.map(
        (item) =>
            `   /**
     * ${item.desc || ""}
     */
    ${item.name}: string;`
    );

    const code = `
/**
 * ${api.title}请求Params参数
 * path: ${api.path}
 * doc url: ${type?.docUrl}
 */
export interface ${type?.reqParamsTypeName} {
    ${fCodes.join("\r\n")}
}`.trim();

    return code;
}