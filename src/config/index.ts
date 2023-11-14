import path from "path";
import { QueryString } from "../QueryString";
import { IConfig } from "../types/config";
import _ from "lodash";
import { EAPIItem, ServiceGroup } from "../types";
import fs from "fs";

export default class ConfigPuppet {

    private oriConfig: IConfig;
    public config: IConfig;
    private configDir: string;

    constructor(configPath: string) {
        this.oriConfig = JSON.parse(fs.readFileSync(configPath, "utf-8")) as IConfig;
        this.configDir = path.dirname(configPath);
        this.config = this.init(this.oriConfig)
    }

    init(oriConfig: IConfig) {
        const config =  _.cloneDeep(oriConfig);
        const { sites, serviceFolder, typesFolder } = config;
        // 解析remoteUrl，设置 projectId 和 server
        // 计算每个service file 和 types file的相对路径
        sites.forEach((site) => {
            for (let i = 0; i < site.projects.length; i++) {
                const project = site.projects[i];
                if (project.remoteUrl && project.remoteUrl.startsWith("http")) {
                    const qs = new QueryString(project.remoteUrl);
                    project.id = +qs.get("pid");
                    project.token = qs.get("token");
                    continue;
                } else if (project.id && project.token) {
                    project.remoteUrl = `${site.server}/api/open/plugin/export-full?type=json&pid=${project.id}&status=all&token=${project.token}`;
                    continue;
                }
                throw new Error("project 必须配置 remoteUrl, 或者 id和token");
            }

            site.services.forEach(service => {
                const typesFileName = (service.fileName || "service") + ".types.ts"
                const sFolder = service.serviceFolder || site.serviceFolder || serviceFolder;
                const tFolder = service.typesFolder || site.typesFolder || typesFolder;
                const rPath = path.relative(sFolder, tFolder);
                service.relativePath = path.join(
                    rPath,
                    typesFileName
                )
            })
        });
        return config;
    }

    getServiceAPIItems(allEApiItems: EAPIItem[], service: IConfig.ServiceItem) {
        const eItems: EAPIItem[] = [];
        switch (service.type) {
            case "api":
                eItems.push(
                    ...allEApiItems.filter((api) =>
                        service.items.includes(api.api._id)
                    )
                );
                break;
            case "cate":
                eItems.push(
                    ...allEApiItems.filter((api) =>
                        service.items.includes(api.api.catid)
                    )
                );
                break;
            case "project":
                eItems.push(
                    ...allEApiItems.filter((api) =>
                        service.items.includes(api.project.id!)
                    )
                );
                break;
            default:
                break;
        }
        return eItems;
    }

    groupServices() {
        const servicesMap = this.innerGroupServices("services");
        const typesMap = this.innerGroupServices("types");
        const services = Array.from(Object.values(servicesMap));
        const types = Array.from(Object.values(typesMap));
        return {
            services,
            types
        }
    }

    private innerGroupServices(type: "types" | "services") {
        const { sites, serviceFolder, typesFolder } = this.config;
        const { configDir } = this;

        const suffix = type == "types" ? ".types.ts" : ".ts";
        const rootConfigFolder = type === "types" ? typesFolder : serviceFolder;
        const groups: Record<
            string,
            ServiceGroup
        > = {};
        sites.forEach((site) => {
            site.services.forEach((service) => {
                const typesFileName = (service.fileName || "service") + suffix;
                const fTypesFile = path.join(
                    configDir,
                    service.typesFolder || site.typesFolder || rootConfigFolder,
                    typesFileName
                );

                if (!groups[fTypesFile])
                    groups[fTypesFile] = {
                        filePath: fTypesFile,
                        services: [],
                    };
                groups[fTypesFile].services.push(service);
            });
        });
        return groups;
    }
}