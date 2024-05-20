import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { launch } from "chrome-launcher";
import runLighthouse from "lighthouse";

async function runLighthouseWithNetwork(networkThrottling, isRemix) {
  const url = networkThrottling.url;
  const chrome = await launch({ chromeFlags: ["--headless"] });
  const lighthouseOptions = {
    port: chrome.port,
    output: "json",
    throttling: networkThrottling,
  };
  const { lhr } = await runLighthouse(url, {
    ...lighthouseOptions,
    extraHeaders: isRemix
      ? {
          Cookie:
            "__session=eyJ1c2VySWQiOiJjbHdmOXY5NmYwMXN0amM3b3RhOXgwOGc0In0%3D.NtFnsjiNdhpgHUTI3FuusuJtuV%2FxRTT7fD4zLRMej7Y",
        }
      : {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNsd2Y5djk2ZjAxc3RqYzdvdGE5eDA4ZzQiLCJlbWFpbCI6InRlc3QyMzQ1QG8yLnBsIiwibmFtZSI6ImV4YW1wbGUgdXNlciIsImNyZWF0ZWRBdCI6IjIwMjQtMDUtMjBUMTg6MDA6NDcuMTQzWiIsInVwZGF0ZWRBdCI6IjIwMjQtMDUtMjBUMTg6MDA6NDcuMTQzWiIsImlhdCI6MTcxNjIyODQ0NSwiZXhwIjoxNzQ3NzY0NDQ1fQ.j60HtUgGCvXYfpwRUd4T_Hmhc8HpZzZY6JR8Ioo-En8",
        },
  });
  await chrome.kill();
  return lhr;
}

async function saveReportToFile(report, outputDirectory, fileName) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePath = path.join(__dirname, outputDirectory, fileName);
  await fs.writeFile(filePath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${filePath}`);
}

async function main() {
  const networkConditions = {
    slow3g: {
      url: "http://localhost:4173/book-group/test838",

      throughputKbps: 0.4 * 1024, // 0.4 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./react+express/3g slow",
      path: "book-group",
    },
    fast3g: {
      url: "http://localhost:4173/book-group/test838",

      throughputKbps: 1.6 * 1024, // 1.6 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./react+express/3g",
      path: "book-group",
    },
    regular: {
      url: "http://localhost:4173/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./react+express/regular",
      path: "book-group",
    },
    cpuSlowdown4: {
      url: "http://localhost:4173/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./react+express/cpu x4",
      path: "book-group",
    },
    cpuSlowdown6: {
      url: "http://localhost:4173/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 6,
      outputDirectory: "./react+express/cpu x6",
      path: "book-group",
    },
    remix_slow3g: {
      url: "http://localhost:3000/book-group/test838",

      throughputKbps: 0.4 * 1024, // 0.4 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./remix/3g slow",
      path: "book-group",
    },
    remix_fast3g: {
      url: "http://localhost:3000/book-group/test838",

      throughputKbps: 1.6 * 1024, // 1.6 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./remix/3g",
      path: "book-group",
    },
    remix_regular: {
      url: "http://localhost:3000/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./remix/regular",
      path: "book-group",
    },
    remix_cpuSlowdown4: {
      url: "http://localhost:3000/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./remix/cpu x4",
      path: "book-group",
    },
    remix_cpuSlowdown6: {
      url: "http://localhost:3000/book-group/test838",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 6,
      outputDirectory: "./remix/cpu x6",
      path: "book-group",
    },
    cat_slow3g: {
      url: "http://localhost:4173/book-group/test838/category",

      throughputKbps: 0.4 * 1024, // 0.4 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./react+express/3g slow",
      path: "category",
    },
    cat_fast3g: {
      url: "http://localhost:4173/book-group/test838/category",

      throughputKbps: 1.6 * 1024, // 1.6 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./react+express/3g",
      path: "category",
    },
    cat_regular: {
      url: "http://localhost:4173/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./react+express/regular",
      path: "category",
    },
    cat_cpuSlowdown4: {
      url: "http://localhost:4173/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./react+express/cpu x4",
      path: "category",
    },
    cat_cpuSlowdown6: {
      url: "http://localhost:4173/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 6,
      outputDirectory: "./react+express/cpu x6",
      path: "category",
    },
    cat_remix_slow3g: {
      url: "http://localhost:3000/book-group/test838/category",

      throughputKbps: 0.4 * 1024, // 0.4 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./remix/3g slow",
      path: "category",
    },
    cat_remix_fast3g: {
      url: "http://localhost:3000/book-group/test838/category",

      throughputKbps: 1.6 * 1024, // 1.6 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./remix/3g",
      path: "category",
    },
    cat_remix_regular: {
      url: "http://localhost:3000/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 1,
      outputDirectory: "./remix/regular",
      path: "category",
    },
    cat_remix_cpuSlowdown4: {
      url: "http://localhost:3000/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 4,
      outputDirectory: "./remix/cpu x4",
      path: "category",
    },
    cat_remix_cpuSlowdown6: {
      url: "http://localhost:3000/book-group/test838/category",

      throughputKbps: 2 * 1024, // 2 Mbps
      cpuSlowdownMultiplier: 6,
      outputDirectory: "./remix/cpu x6",
      path: "category",
    },
  };

  for (const [conditionName, { path, ...throttling }] of Object.entries(
    networkConditions
  )) {
    console.log(
      `Running Lighthouse with ${conditionName} network conditions...`
    );
    const lhr = await runLighthouseWithNetwork(
      throttling,
      conditionName.includes("remix")
    );
    const fileName = `${path}.json`;
    await saveReportToFile(lhr, throttling.outputDirectory, fileName);
  }
}

main().catch(console.error);
