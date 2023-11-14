import axios from "axios";
import { IConfig } from "../types/config";
import { EAPIItem } from "../types";
import { CateItem } from "../types/yapi";

const ins = axios.create();

export function getProjectData(url: string) {
    return ins.get(url).then((res) => res.data);
}

export async function downloadProjects(
    site: IConfig.SiteItem,
    cacheProjectsPath: string
) {
    // 生成新project数据结构，并本地缓存
    const eApiItems: EAPIItem[] = [];

    for (let i = 0; i < site.projects.length; i++) {
        const project = site.projects[i];
        const cates: CateItem[] = await getProjectData(
            project.remoteUrl!
        );
        cates.forEach((cate) => {
            const eItems = cate.list.map((api) => {
                const eItem: EAPIItem = {
                    api,
                    project,
                    cate,
                    site,
                };
                return eItem;
            });
            eApiItems.push(...eItems);
        });
    }
    return eApiItems;
}