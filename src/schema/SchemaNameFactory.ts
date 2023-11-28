import { randomUUID } from "crypto";
import { JSONSchema } from "json-schema-to-typescript";
import { firstToUpper } from "../util";

interface SchemaInfo {
    parentKey: string | undefined,
    key: string,
    schema: JSONSchema
}

interface NameHandler {
    (params: { schemaInfo: SchemaInfo, isExist: IsExistHandler }): string;
}

interface IsExistHandler {
    (name: string): boolean;
}



const defaultNameHandler: NameHandler = function ({ schemaInfo, isExist }) {
    const { parentKey, key } = schemaInfo;
    const baseName = `${firstToUpper(parentKey || '')}${firstToUpper(key)}`;
    let tryName = baseName;
    for (let i = 0; i < 20; i++) {
        if (!isExist(tryName)) {
            return tryName
        }
        tryName = `${baseName}${i + 1}`
    }
    return `${baseName}_${randomUUID()}`
};



export default class SchemaNameFactory {

    constructor(private nameHandler: NameHandler = defaultNameHandler) {

    }

    usedNames: Set<string> = new Set<string>();

    reset() {
        this.usedNames.clear();
    }


    isExist = (name: string) => {
        return this.usedNames.has(name);
    };


    gen(schemaInfo: SchemaInfo) {
        const { isExist } = this;
        const name = this.nameHandler({
            schemaInfo,
            isExist
        })
        this.usedNames.add(name);
        return name;
    }
}