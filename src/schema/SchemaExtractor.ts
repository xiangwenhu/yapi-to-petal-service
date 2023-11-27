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


    private recompileObject(schema: JSONSchema, rootSchema: JSONSchema = schema) {
        if (schema.type !== "object" || !schema.properties) {
            return schema;
        }

        const keyValues: [string, JSONSchema][] = Object.entries(schema.properties)
        for (let [key, pSchema] of keyValues) {
            const typeStr = pSchema.type as string;
            if (!TYPES.includes(typeStr)) {
                continue;
            }
            // 对象
            if (pSchema.type === "object") {
                const definitionName = firstToUpper(key);
                rootSchema.definitions = rootSchema.definitions || {};
                rootSchema.definitions[definitionName] = this.recompileSchema(pSchema, rootSchema);
                schema.properties[key] = { $ref: `#/definitions/${definitionName}` };
                continue;
            }
            // 数组
            rootSchema.definitions = rootSchema.definitions || {};
            const definitionName = `${firstToUpper(key)}Item`;
            const newSchema = this.recompileSchema(pSchema.items!, rootSchema);
            // const { items, properties, ...ps } = newSchema;
            // TODO:: default会影响结果生成，比如是一个对象，default是一个字符串，结果会成为 string & Item[]
            delete pSchema.default;
            rootSchema.definitions[definitionName] = newSchema;
            pSchema.items = {
                $ref: `#/definitions/${definitionName}`
            }
            schema.properties[key] = pSchema;
        }
        return schema;

    }


    private recompileArray(schema: JSONSchema, rootSchema: JSONSchema) {
        return schema;
    }


    private recompileSchema(schema: JSONSchema, rootSchema: JSONSchema = schema) {
        // 么有属性 + 么有 items
        if (schema.type != "array" && schema.type !== "object") {
            return schema;
        }

        if (schema.type === "object") {
            return this.recompileObject(schema, rootSchema);
        }
        return this.recompileArray(schema, rootSchema);

    }


    async toTypeScript(name: string, options: Partial<Options> | undefined) {
        const schema = this.clone(this.schema);
        const newSchema = this.recompileSchema(schema);
        console.log("newSchema:", newSchema);
        const types = await jsonSchemeToTypeScript(newSchema, name, options);
        return types
    }


}