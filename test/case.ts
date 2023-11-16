import path from "path";
import Factory from "../src/Facotry";
import { FactoryOptions } from "../src/types/factory";

const configPath = path.join(__dirname, "../demodata/config/demo.json");

(async function () {
    const options: FactoryOptions = {
        api: {
            beforeImports(params) {
                let importsContent: string[] = [];
                importsContent.push(`import axios from "axios"`);
                importsContent.push(
                    `import { compile } from "path-to-regexp";`
                );

                const iPath = params.getImportPath(
                    path.join(__dirname, "./case_ori.ts")
                );
                console.log("iPath", iPath);

                importsContent.push(`import * as xxx from "${iPath}"`);
                return importsContent;
            },
            afterImport() {
                return `
function pathToUrl(path: string, pathParams: Object | undefined) {
    const toPath = compile(path, { encode: encodeURIComponent });
    const rPath = toPath(pathParams);
    return rPath;
}`.trim();
            },
        },
    };

    const factory = new Factory(configPath, options);
    await factory.build();
})();
