import { IConfig } from "../types/config";


// fullPath=${server}/api/open/plugin/export-full?type=json&pid=${pid}&status=all&token=${token}


function getFullUrl(config: IConfig){
    return `${config}/api/open/plugin/export-full?type=json&pid=${pid}&status=all&token=${token}`
}

/**
 * 
 * @param config 
 */

function initConfig(config: IConfig){

}