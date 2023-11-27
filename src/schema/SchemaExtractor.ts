import { Schema } from "inspector";
import { JSONSchema, Options } from "json-schema-to-typescript";
import { jsonSchemeToTypeScript } from ".";
import { firstToUpper } from "../util";
import _ from "lodash";


const TYPES = ["array", "object"];

export default class SchemaExtractor {
    constructor(private schema: JSONSchema,) {
    }

    private clone(schema: JSONSchema) {
        return JSON.parse(JSON.stringify(schema)) as JSONSchema
    }

    private reCompileSchema(schema: JSONSchema, rootSchema: JSONSchema = schema) {
        // 么有属性 + 么有 items
        if (schema.properties == undefined && schema.items == undefined) {
            return schema;
        }

        const ppkey = _.isObject(schema.properties) ? "properties" : "items";

        // @ts-ignore
        const keyValues: [string, JSONSchema][] = Object.entries(schema[ppkey])

        for (let [key, pSchema] of keyValues) {
            const typeStr = pSchema.type as string;
            if (!TYPES.includes(typeStr)) {
                continue;
            }
            // 对象
            if (pSchema.type === "object") {
                const definitionName = firstToUpper(key);
                rootSchema.definitions = rootSchema.definitions || {};
                rootSchema.definitions[definitionName] = this.reCompileSchema(pSchema, rootSchema);
                // @ts-ignore
                schema[ppkey][key] = { $ref: `#/definitions/${definitionName}` };
                continue;
            }
            // 数组
            rootSchema.definitions = rootSchema.definitions || {};
            const definitionName = `${firstToUpper(key)}Item`;
            const newSchema = this.reCompileSchema(pSchema.items!, rootSchema);
            // const { items, properties, ...ps } = newSchema;
            // TODO:: default会影响结果生成，比如是一个对象，default是一个字符串，结果会成为 string & Item[]
            delete pSchema.default;
            rootSchema.definitions[definitionName] = newSchema;
            pSchema.items = {
                $ref: `#/definitions/${definitionName}`
            }
            // @ts-ignore
            schema[ppkey][key] = pSchema;
        }


        return schema
    }


    async toTypeScript(name: string, options: Partial<Options> | undefined) {
        const schema = this.clone(this.schema);
        const newSchema = this.reCompileSchema(schema);
        console.log("newSchema:", newSchema);
        const types = await jsonSchemeToTypeScript(newSchema, name, options);
        return types
    }


}