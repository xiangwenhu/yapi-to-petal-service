import path from "path";
import Factory from "../factory";
import { FactoryOptions } from "../types/factory";

const configPath = path.join(__dirname, "../../demodata/config/demo.json");

(async function () {

    const options: FactoryOptions = {
        apis: {
            header(sg){
                return `import { apiService } from '@/services/BaseService';`
            }
        }
    }

    const factory = new Factory(configPath, options);
    await factory.build();


})();
