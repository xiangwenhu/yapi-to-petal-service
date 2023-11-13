import {mock} from "mockjs";

export function mockToTypeScript(mr: Record<string, string> = {}) {
    const result = mock(mr);
    return simpleConvert(result);
}

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
