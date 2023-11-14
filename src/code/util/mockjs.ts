import * as  mockjs from "mockjs";
import { jsonSchemeToTypeScript } from "../../schema";
import { JSONSchema4 } from "json-schema";

export function mockToTypeScript(mr: Record<string, string> = {}) {
    const result = mockjs.mock(mr);
    return simpleConvert(result);
}

// function mockjsToJSONSchema_To_JSON4Schema(schema: mockjs.MockjsToJSONSchemaRs) {
//     // @ts-ignore
//     schema.title = schema.name;
//     if (schema.properties) {
//         schema.properties = schema.properties.map(item => mockjsToJSONSchema_To_JSON4Schema(item))
//     }
//     return schema;
// }


// export async function mockToTypeScript(mr: Record<string, string> = {}, typeName: string) {
//     const mSchema = mockjs.toJSONSchema(mr);
//     const schema = mockjsToJSONSchema_To_JSON4Schema(mSchema) as JSONSchema4;;
//     if (!schema.$schema) {
//         schema.$schema = "http://json-schema.org/draft-04/schema#";
//     }
//     const code = await jsonSchemeToTypeScript(schema, typeName, {
//         bannerComment: "",
//     });
//     debugger;
//     return code;
// }

function simpleConvert(json: Record<string, any>) {
    const types: string[] = ["{"];
    for (let [key, value] of Object.entries(json)) {
        const valueType = getValueType(value);
        types.push(`\t${key}:${valueType};`);
    }
    types.push("}")
    return types.join("\r\n")
}

const toString = Object.prototype.toString;
function getValueType(value: any) {
    const type = typeof value;
    if (type !== "object") {
        return type;
    }
    const oType = toString.call(new Map()).slice(8, -1);
    switch (oType) {
        case "RegExp":
        case "Date":
        case "Error":
            return oType;
        case "Array":
            return "any[]";
        case "Function":
            return "function";
        case "Object":
            return "Record<PropertyKey, any>";
        case "Map":
            return `Map<any, any>`;
        case "Set":
            return "Set<any>";
        default:
            return "any";
    }
}
