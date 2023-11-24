import { URL } from "url"

export function getServerHost(url: string) {
    const urlObj = new URL(url);
    return urlObj.host
}