import axios from "axios";
import { IConfig } from "../types/config";
import { EAPIItem } from "../types";
import { CateItem, YAPI } from "../types/yapi";

const ins = axios.create();

export function getProjectData(url: string) {
    return ins.get(url).then((res) => res.data);
}


const apiModeService = {
    async getList(project: IConfig.YPIProject) {
        // http://xxxx/api/interface/list?token=xxx&project_id=xx
        const url = `${project.remoteUrl!}/api/interface/list?token=${project.token!}&project_id=${project.id}&limit=10000`
        const res = await ins.get<YAPI.ResAPIList>(url);
        if (!res || !res.data || res.data.errcode != 0) {
            throw new Error(`getList error ${res?.data?.errmsg || '未知错误'}`);
        }
        return res.data.data;
    },
    async getDetail(project: IConfig.YPIProject, id: number) {
        const url = `${project.remoteUrl!}/api/interface/get?token=${project.token!}&id=${id}`
        const res = await ins.get<YAPI.ResAPIDetail>(url);
        if (!res || !res.data || res.data.errcode != 0) {
            throw new Error(`getList error ${res?.data?.errmsg || '未知错误'}`);
        }
        return res.data.data;
    },

    async listMenu(project: IConfig.YPIProject,) {
        const url = `${project.remoteUrl!}/api/interface/list_menu?token=${project.token!}&project_id=${project.id}`
        const res = await ins.get<YAPI.ResMenuList>(url);
        if (!res || !res.data || res.data.errcode != 0) {
            throw new Error(`getList error ${res?.data?.errmsg || '未知错误'}`);
        }
        return res.data.data;
    }
}



async function getApiModeProjectData(project: IConfig.YPIProject) {
    const cates = await apiModeService.listMenu(project);
    for (let i = 0; i < cates.length; i++) {
        const cate = cates[i];
        for (let index = 0; index < cate.list.length; index++) {
            const item = cate.list[index];
            const apiItem = await apiModeService.getDetail(project, item._id);
            cate.list[index] = apiItem;
        }
    }
    return cates;

}


export async function downloadProjects(
    site: IConfig.SiteItem,
    cacheProjectsPath: string
) {
    // 生成新project数据结构，并本地缓存
    const eApiItems: EAPIItem[] = [];

    for (let i = 0; i < site.projects.length; i++) {
        const project = site.projects[i];

        let cates: CateItem[];
        if (project.type === "api") {
            cates = await getApiModeProjectData(project);
        } else {
            cates = await getProjectData(
                project.remoteUrl!
            );
        }
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