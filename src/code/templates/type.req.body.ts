import { JSONSchema4 } from "json-schema";
import { EAPIItem } from "../../types";
import { jsonSchemeToTypeScript } from "../../schema";
import { getTypeByFormType } from "../../util/typesTransformer";
import SchemaExtractor from "../../schema/SchemaExtractor";
import { generateNamespace } from "../util"

function genCodeByForm({ api, type }: EAPIItem) {
    const fCodes = (api.req_body_form || []).map(
        (item) =>
            `   /**
     * ${item.desc || ""}
     */
    ${item.name}${item.required == "1" ? "" : "?"}: ${getTypeByFormType(
                item.type
            )};`
    );

    const code = `
/**
 * ${api.title}请求参数
 * path: ${api.path}
 * doc url: ${type?.docUrl}
 */
export interface ${type?.reqBodyTypeName} {
    ${fCodes.join("\r\n")}
    [k: string]: unknown;
}`.trim();

    return code;
}

/**
 * 生成请求参数的TypeScript
 * @param api
 * @returns
 */
export default async function generateReqBodyType(eApi: EAPIItem) {
    const { api, type } = eApi;
    let code = "";
    if (!api) {
        return null;
    }
    const typeName = type!.reqBodyTypeName!;
    // 请求是JSON Schema
    if (api.req_body_type === "json") {
        if (api.req_body_is_json_schema) {
            const schema: JSONSchema4 = JSON.parse(api.req_body_other || "{}");

            schema.title = type?.reqBodyTypeName;
            if (!schema.description) {
                schema.description = `${api.title}请求参数\r\npath: ${api.path}\r\ndoc url: ${type?.docUrl}`;
            }
            if (!schema.$schema) {
                schema.$schema = "http://json-schema.org/draft-04/schema#";
            }
            const extractor = new SchemaExtractor(schema);

            const result = await extractor.toTypeScript(typeName, {
                bannerComment: "",
                additionalProperties: false
            });

            code = result.code;
            // 有额外的定义, 生成 namespace
            if (Object.keys(result.schema.definitions || {}).length > 0) {
                code = generateNamespace(code, typeName);
            }

        } else {
            code = `
/**
 * ${api.title}请求Body
 * path: ${api.path}
 * url: ${type?.docUrl} 
 **/
export interface ${typeName} ${api.req_body_other}
            `.trim();

        }
    } else if (api.req_body_type == "form") {
        code = genCodeByForm(eApi)
    } else {
        code = "";
    }


    return {
        code,
        typeName,
        apiInfo: api,
    };
}
