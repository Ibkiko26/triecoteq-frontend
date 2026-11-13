import { cp } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "dist");

for (const directory of ["admin", "assets", "content", "Images"]) {
  await cp(resolve(root, directory), resolve(output, directory), {
    recursive: true,
    force: true
  });
}
