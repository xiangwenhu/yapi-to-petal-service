import { EAPIItem } from "../types";
import generateRequest from "./templates/api.request";

export async function genRequest(list: EAPIItem[]) {
    const results: string[] = [];
    for (let i = 0; i < list.length; i++) {
        const eApi = list[i];
        const code = generateRequest(eApi);
        results.push(code);
    }
    return results.filter(Boolean).join("\r\n\r\n");
}
