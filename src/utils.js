const fs = require("fs");
const path = require("path");
const d3 = require("d3");
const yargs = require("yargs");
const name = require("../package").name;
const description = require("../package").description;
const version = require("../package").version;

const cachePath = path.resolve(__dirname, "../cache.json");

module.exports.cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath).toString())
  : { location: {}, stargazer: {} };

const persistCache = () => {
  const json = JSON.stringify(module.exports.cache, undefined, 2);
  console.log(`Cache saved to ${cachePath}`);
  fs.writeFileSync(cachePath, json);
};

process.on("uncaughtException", e => console.error(e));
process.on("unhandledRejection", e => console.error(e));
process.on("beforeExit", persistCache);

module.exports.getCountryPopularity = stargazers =>
  stargazers.reduce(
    ([countryPopularity, max], stargazer) => {
      if (stargazer.country) {
        const name = stargazer.country.long_name;
        const rate = (countryPopularity.get(name) || 0) + 1;

        max = Math.max(rate, max);
        countryPopularity.set(name, rate);
      }

      return [countryPopularity, max];
    },
    [d3.map(), 0]
  );

module.exports.argv = yargs
  .scriptName(name)
  .epilogue(`${description}`)
  .version(version)
  .help("help")
  .option("github-token", {
    description: "GitHub token, alternatively GITHUB_TOKEN env var",
    default: process.env.GITHUB_TOKEN,
    required: true
  })
  .option("google-token", {
    description: "Google API token, alternatively GOOGLE_TOKEN env var",
    default: process.env.GOOGLE_TOKEN,
    required: true
  })
  .option("output", {
    alias: "o",
    description: "Output path",
    default: "worldmap.svg",
    required: true
  })
  .option("repo", {
    alias: "r",
    description: "GitHub repo to parse, e.g. dyatko/arkit",
    required: true
  }).argv;
