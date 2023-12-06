import path from "path";
import ConfigPuppet from "../config";
import { EAPIItem, ServiceGroup } from "../types";
import * as loader from "../loader";
import * as saver from "../saver";
import NamesFactory from "../code/NameFactory";
import { getFullApiDocUrl } from "../code/util";
import { genTypeScript } from "../code/ts";
import generateApiHeader from "../code/templates/api.header";
import { genRequest } from "../code/api";
import { CommonGenHandler, FactoryOptions } from "../types/factory";
import builtInOptions from "./builtIn";
import _ from "lodash";
import { format } from "../util/prettier";

export default class Factory {
    private configManager: ConfigPuppet;
    private eApiItems: EAPIItem[];

    private configDir: string;

    private oriOptions: FactoryOptions;
    // @ts-ignore
    private options: FactoryOptions;

    constructor(configPath: string, options: FactoryOptions = {}) {
        this.configDir = path.dirname(configPath);
        this.configManager = new ConfigPuppet(configPath);
        this.eApiItems = [];
        this.oriOptions = options;

        this.initOptions()
    }

    normalOptions(options: FactoryOptions = {}) {
        const cOptions = _.cloneDeep(options);
        ["content", "header", "footer", "item"].forEach(key => {
            // @ts-ignore
            let handlers: CommonGenHandler[] | undefined = (cOptions.types || {})[key] as CommonGenHandler[] | undefined;
            if (cOptions.types && handlers && !Array.isArray(handlers)) {
                // @ts-ignore
                cOptions.types[key] = [handlers];
            }

            // @ts-ignore
            handlers = (cOptions.apis || {})[key] as CommonGenHandler[] | undefined;;
            if (cOptions.apis && handlers && !Array.isArray(handlers)) {
                // @ts-ignore
                cOptions.apis[key] = [handlers];
            }
        })
        return cOptions;
    }

    private initOptions() {
        const nOptions = this.normalOptions(this.oriOptions);
        const bOptions = this.normalOptions(builtInOptions)
        this.options = _.mergeWith({}, bOptions, nOptions, function (value: any, srcValue: any, key: string, object: any, source: any) {
            if (Array.isArray(value)) {
                return (value || []).concat(srcValue || [])
            }
        });
    }

    private async downloadProjects() {
        const { sites } = this.configManager.config;
        // 全部转为 EAPIItem
        const eApiItems: EAPIItem[] = [];
        for (let i = 0; i < sites.length; i++) {
            const site = sites[i];
            // TODO:: cache
            const cachePath = path.join(process.cwd(), ".ys-cache")
            const eItems = await loader.downloadProjects(site, cachePath);
            eApiItems.push(...eItems);
        }
        this.eApiItems = eApiItems;
    }

    async build() {
        await this.downloadProjects();
        const { types, services } = this.configManager.groupServices();
        await this.buildTypes(types);
        await this.buildServices(services);
    }

    private buildTypes(typesGroup: ServiceGroup[]) {
        const { configManager, eApiItems } = this;
        // 按照组，找到api，并且生成文件
        typesGroup.forEach(async (g) => {
            const eItems: EAPIItem[] = [];
            g.services.forEach((s) => {
                const sEItems = configManager.getServiceAPIItems(eApiItems, s);
                eItems.push(...sEItems);
            });
            console.log("eItems", eItems.length);

            const nameFactory = new NamesFactory(eItems);
            nameFactory.gen();

            eItems.forEach((item) => {
                const names = nameFactory.getName(item);
                item.type = {
                    ...names,
                    docUrl: getFullApiDocUrl({
                        server: item.site.server,
                        projectId: item.project.id!,
                        apiId: item.api._id,
                    }),
                };
            });

            let tsStr = await genTypeScript(eItems);
            console.log("tsStr:", tsStr);
            tsStr = await format(tsStr);
            saver.save(g.filePath, tsStr);
        });
    }

    buildParts(handlers: CommonGenHandler[] | undefined, sg: ServiceGroup) {
        if (!Array.isArray(handlers)) {
            return []
        }
        return handlers.map(h => {
            const content = h.call(undefined, sg)
            return content;
        }).flat();
    }

    private async buildServices(servicesGroup: ServiceGroup[]) {
        const { configManager, eApiItems } = this;
        // 生成文件
        for (let i = 0; i < servicesGroup.length; i++) {
            const g = servicesGroup[i];
            let servicesContent: string[] = this.buildParts(this.options.apis?.content as any[], g);
            let headersContent: string[] = this.buildParts(this.options.apis?.header as any[], g)
            for (let sIndex = 0; sIndex < g.services.length; sIndex++) {
                const service = g.services[sIndex];
                const sEItems = configManager.getServiceAPIItems(
                    eApiItems,
                    service
                );
                const requestHeaderStr = generateApiHeader(
                    sEItems,
                    service.relativePath!
                );
                const requestStr = await genRequest(sEItems);

                headersContent.push(requestHeaderStr);
                servicesContent.push(requestStr);
            }
            let content =
                headersContent.join("\r\n") +
                "\r\n\r\n" +
                servicesContent.join("\r\n");

            content = await format(content);
            saver.save(g.filePath, content);
        }
    }
}
