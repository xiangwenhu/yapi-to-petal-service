import axios from "axios";

const ins = axios.create();

export function getProjectData(url: string) {
    return ins.get(url).then((res) => res.data);
}
