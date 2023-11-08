import { APIItem } from "../types/yapi";

export function getTypeByFormType(type: APIItem.FormParamType) {
    switch (type) {
        case "text":
            return "string";
        case "file":
            return "Blob";
        default:
            return "any";
    }
}