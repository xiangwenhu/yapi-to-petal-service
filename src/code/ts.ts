import { JSONSchema4 } from "json-schema";
import { jsonSchemeToTypeScript } from "../schema";
import { firstToUpper } from "../util";
import { getTypeByFormType } from "../util/typesTransformer";
import { EAPIItem } from "../types";
import { APIItem } from "../types/yapi";
import NamesFactory from "./NameFactory";

function genCodeByForm(typeName: string, api: APIItem) {
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
 */
export interface ${typeName} {
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
async function generateReqBodyType(typeName: string, eApi: EAPIItem) {
    const { api } = eApi;
    let code = "";
    if (!api) {
        return null;
    }
    // 请求是JSON Schema
    if (api.req_body_is_json_schema) {
        const schema: JSONSchema4 = JSON.parse(api.req_body_other || "{}");

        schema.title = typeName;
        if (!schema.description) {
            schema.description = `${api.title}请求参数\r\npath: ${api.path}`;
        }
        if (!schema.$schema) {
            schema.$schema = "http://json-schema.org/draft-04/schema#";
        }
        code = await jsonSchemeToTypeScript(schema, typeName, {
            bannerComment: "",
        });
        return {
            schema,
            code,
            typeName,
            apiInfo: api,
        };
    } else if (api.req_body_type == "form") {
        return {
            code: genCodeByForm(typeName, api),
            typeName,
            apiInfo: api,
        };
    }
    return null;
}

/**
 * 生成响应的TS
 * @param api
 * @returns
 */
async function generateResBodyType(typeName: string, eApi: EAPIItem) {
    const { api } = eApi;
    let code = "";
    if (!api) {
        return null;
    }

    // 响应是JSON Schema
    if (api.res_body_type === "json" && api.res_body_is_json_schema) {
        const schema: JSONSchema4 = JSON.parse(api.res_body || "{}");
        if (!schema.description) {
            schema.description = `${api.title}响应结果\r\npath: ${api.path}`;
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

function generateReqQueryType(typeName: string, eApi: EAPIItem) {
    const { api } = eApi;
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
 */
export interface ${typeName} {
    ${fCodes.join("\r\n")}
    [k: string]: unknown;
}`.trim();

    return code;
}

function genReqParamsType(typeName: string, eApi: EAPIItem) {
    const { api } = eApi;
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
 */
export interface ${typeName} {
    ${fCodes.join("\r\n")}
    [k: string]: unknown;
}`.trim();

    return code;
}

export async function genTypeScript(list: EAPIItem[]) {
    const nameFactory = new NamesFactory(list);
    nameFactory.gen();
    const results: string[] = [];
    for (let i = 0; i < list.length; i++) {
        const eApi = list[i];
        const names = nameFactory.getName(eApi);

        if (names.hasReqParams) {
            const reqParamsType = genReqParamsType(names.reqParamsTypeName!, eApi)
            results.push(reqParamsType)
        }
        if (names.hasReqQuery) {
            const reqQueryType = genReqParamsType(names.reqQueryTypeName!, eApi)
            results.push(reqQueryType)
        }
        if (names.hasReqBody) {
            const reqBodyType = await generateReqBodyType(names.reqBodyTypeName!, eApi)
            results.push(reqBodyType?.code || '')
        }
        if (names.hasResBody) {
            const resBodyType = await generateResBodyType(names.resBodyTypeName!, eApi);
            results.push(resBodyType?.code || "");
        }

    }
    return results.filter(Boolean).join("\r\n");
}
