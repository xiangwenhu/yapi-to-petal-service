import { JSONSchema4 } from "json-schema";
import { EAPIItem } from "../../types";
import { jsonSchemeToTypeScript } from "../../schema";
import { mockToTypeScript } from "../util/mockjs";

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
    if (api.res_body_type === "json") {
        if (api.res_body_is_json_schema) {
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
        } else {
            // const schema: JSONSchema4 = mockjs.toJSONSchema(JSON.parse(api.res_body)) as JSONSchema4;
            // if (!schema.description) {
            //     schema.description = `${api.title}响应结果\r\npath: ${api.path}\r\ndoc url: ${type?.docUrl}`;
            // }
            // schema.title = typeName;
            // code = await jsonSchemeToTypeScript(schema, typeName, {
            //     bannerComment: "",
            // });
            // return {
            //     schema,
            //     code,
            //     typeName,
            //     apiInfo: api,
            // };

            const typeStr = await mockToTypeScript(JSON.parse(api.res_body));
            const code = `
/**
 * ${api.title}响应结果
 * path: ${api.path}
 * url: ${type?.docUrl}
 **/
export interface ${typeName} ${typeStr}
            `.trim()
            return {
                code
            }
        }
    }
    return {
        code: `
    export interface ${typeName} ${api.res_body}
    `.trim(),
    };
}
