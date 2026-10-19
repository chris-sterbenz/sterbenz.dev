import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const sha =
  process.env.GITHUB_SHA ||
  execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[a-f0-9]{40}$/.test(sha))
  throw new Error("Expected a full Git commit SHA");
writeFileSync("dist/_build.json", JSON.stringify({ sha }) + "\n");
