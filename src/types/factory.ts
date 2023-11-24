import { ServiceGroup } from "."

export interface CommonGenHandler {
    (serviceGroup: ServiceGroup): string | string[];
}

interface CommonHandlers {
    header?: CommonGenHandler | CommonGenHandler[];
    content?: CommonGenHandler | CommonGenHandler[];
    footer?: CommonGenHandler | CommonGenHandler[];
    item?: CommonGenHandler | CommonGenHandler[];
}

interface LifeCycleHandler {
}


export interface FactoryOptions {
    types?: CommonHandlers;
    apis?: CommonHandlers;
}
