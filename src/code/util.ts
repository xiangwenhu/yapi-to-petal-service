import { EAPIItem } from "../types";

export function getFullApiDocUrl(eApi: EAPIItem) {
    const { api, site, project } = eApi;
    return `${site.server}/project/${project.id}/interface/api/${api._id}`
}
