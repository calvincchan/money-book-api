const { name, version } = require("./package.json");
const fs = require("fs");
const git = require("git-rev-sync");

async function main() {
  const versionObject = {
    name,
    version,
    createdAt: new Date(),
    gitBranch: git.branch(),
    gitShort: git.short(),
    gitDate: git.date(),
    gitCount: git.count(),
  };
  fs.writeFileSync("src/version.ts", `export default ${JSON.stringify(versionObject)};`);
}

main();
