import fs from 'fs';
import schema from "../../demodata/schema/pc";

import SchemaExtractor from "../schema/SchemaExtractor";
import path from 'path';



; (async function () {
  const sSplit = new SchemaExtractor(schema);

  const typeStr = await sSplit.toTypeScript("UserList", {
    unknownAny: true
  });

  console.log("results:", typeStr);

  fs.writeFileSync(path.join(__dirname, "../../demoService/test.ts"), typeStr)

})()


