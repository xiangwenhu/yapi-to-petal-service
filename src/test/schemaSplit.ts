import fs from 'fs';
import schema from "../../demodata/schema/pc";

import SchemaExtractor from "../schema/SchemaExtractor";
import path from 'path';


; (async function () {
  const sSplit = new SchemaExtractor(schema);

  const { code } = await sSplit.toTypeScript("ResPerformanceDetailBody", {
    unknownAny: true,
    additionalProperties: false
  });

  console.log("results:", code);

  fs.writeFileSync(path.join(__dirname, "../../demoService/test.ts"), code)

})()


