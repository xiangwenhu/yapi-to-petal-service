import { JSONSchema4 } from "json-schema";
import { EAPIItem } from "../../types";
import { jsonSchemeToTypeScript } from "../../schema";

/**
 * 生成响应的TS
 * @param api
 * @returns
 */
export default async function generateResBodyType(eApi: EAPIItem) {
    const { api, type } = eApi;
    let code = "";
    if (!api) {
        return null;
    }
    const typeName = type!.resBodyTypeName!;
    // 响应是JSON Schema
    if (api.res_body_type === "json" && api.res_body_is_json_schema) {
        const schema: JSONSchema4 = JSON.parse(api.res_body || "{}");
        if (!schema.description) {
            schema.description = `${api.title}响应结果\r\npath: ${api.path}\r\ndoc url: ${type?.docUrl}`;
        }
        schema.title = typeName;
        code = await jsonSchemeToTypeScript(schema, typeName, {
            bannerComment: "",
        });
        return {
            schema,
            code,
            typeName,
            apiInfo: api,
        };
    }
    return null;
}