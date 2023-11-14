import path from "path";
import Factory from "../src/Facotry";

const configPath = path.join(__dirname, "../demodata/config/demo.json");

(async function () {

    const factory = new Factory(configPath);
    await factory.build();


})();
