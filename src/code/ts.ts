import { JSONSchema4 } from "json-schema";
import { jsonSchemeToTypeScript } from "../schema";
import { firstToUpper } from "../util";
import { getTypeByFormType } from "../util/typesTransformer";
import { EAPIItem } from "../types";
import { APIItem } from "../types/yapi";

/**
 * 请求参数的类名
 * @param apiName
 * @returns
 */
function getReqQueryTypeName(apiName: string) {
    return `Req${firstToUpper(apiName)}Param`;
}

/**
 * 请求参数的类名
 * @param apiName
 * @returns
 */
function getReqBodyTypeName(apiName: string) {
    return `Req${firstToUpper(apiName)}Body`;
}

/**
 * 响应结果的类名
 * @param apiName
 * @returns
 */
function getResTypeName(apiName: string) {
    return `Res${firstToUpper(apiName)}`;
}


function genCodeByForm(typeName: string, api: APIItem) {
    const fCodes = (api.req_body_form || []).map(item => (
        `   /**
     * ${item.desc || ''}
     */
    ${item.name}${item.required == "1" ? "" : "?"}: ${getTypeByFormType(item.type)};`));

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
async function generateReqBodyType(eApi: EAPIItem) {
    const { api } = eApi;
    let code = '';
    const typeName = getReqBodyTypeName(api.title);
    if (!api) {
        return null;
    }
    // 请求是JSON Schema
    if (api.req_body_is_json_schema) {
        const schema: JSONSchema4 = JSON.parse(api.req_body_other || '{}');

        schema.title = typeName;
        if (!schema.description) {
            schema.description = `${api.title}请求参数\r\npath: ${api.path}`;;
        }
        if (!schema.$schema) {
            schema.$schema = 'http://json-schema.org/draft-04/schema#';
        }
        code = await jsonSchemeToTypeScript(
            schema,
            typeName,
            {
                bannerComment: '',
            },
        );
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
            apiInfo: api
        }
    }
    return null;
}

/**
 * 生成响应的TS
 * @param api
 * @returns
 */
async function generateResBodyType(api: APIItem) {
    let code = '';

    const typeName = getResTypeName(api.title);
    if (!api) {
        return null;
    }

    // 响应是JSON Schema
    if (api.res_body_type === 'json' && api.res_body_is_json_schema) {
        const schema: JSONSchema4 = JSON.parse(api.res_body || '{}');
        if (!schema.description) {
            schema.description = `${api.title}响应结果\r\npath: ${api.path}`;
        }
        schema.title = typeName;
        code = await jsonSchemeToTypeScript(
            schema,
            typeName,
            {
                bannerComment: '',
            },
        );
        return {
            schema,
            code,
            typeName,
            apiInfo: api,
        };
    }
    return null;
}

function generateReqQueryType(api: APIItem) {
    const typeName = getReqQueryTypeName(api.title);
    const req_query = api.req_query;
    if (!Array.isArray(req_query) || req_query.length === 0) {
        return ""
    }


    const fCodes = req_query.map(item => (
        `   /**
     * ${item.desc || ''}
     */
    ${item.name}${item.required == "1" ? "" : "?"}: string;`));

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


const BUILTIN_TYPES = [
    `export type CommonString = string;`,
    `export type CommonKeyValue = Record<string, any>`
]

export async function genTypeScript(list: EAPIItem[]) {
    const results: string[] = [];
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        const reqBodyType = await generateReqBodyType({
            ...item
        })
        const reqQueryType = generateReqQueryType(item.api);

        const resBodyType = await generateResBodyType({
            ...item.api
        })
        results.push(reqQueryType)
        results.push(reqBodyType?.code || '');
        results.push(resBodyType?.code || '');
    }
    return BUILTIN_TYPES.concat(results).filter(Boolean).join("\r\n");
}


