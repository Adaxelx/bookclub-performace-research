import fs from "fs";
import path from "path";
import xlsx from "xlsx";

function extractLighthouseMetrics(jsonFilePath) {
  const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

  const metrics = {
    "Performance Score": data.categories.performance.score * 100,
    "First Contentful Paint (FCP)":
      data.audits["first-contentful-paint"].displayValue,
    "Speed Index": data.audits["speed-index"].displayValue,
    "Largest Contentful Paint (LCP)":
      data.audits["largest-contentful-paint"].displayValue,
    "Time to Interactive (TTI)": data.audits["interactive"].displayValue,
    "Total Blocking Time (TBT)":
      data.audits["total-blocking-time"].displayValue,
    "Cumulative Layout Shift (CLS)":
      data.audits["cumulative-layout-shift"].displayValue,
  };

  return metrics;
}

function traverseDirectory(directory, callback, relativePath = "") {
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err) {
        console.error(`Error reading directory ${directory}:`, err);
        reject(err);
        return;
      }

      const promises = files.map((file) => {
        const filePath = path.join(directory, file);
        const relativeFilePath = path.join(relativePath, file);

        return new Promise((resolve, reject) => {
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error(`Error getting stats for file ${filePath}:`, err);
              reject(err);
              return;
            }

            if (stats.isDirectory()) {
              traverseDirectory(filePath, callback, relativeFilePath)
                .then(resolve)
                .catch(reject);
            } else if (stats.isFile() && filePath.endsWith(".json")) {
              callback(relativeFilePath, filePath);
              resolve();
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject);
    });
  });
}

function collectMetrics(rootDirectories) {
  return new Promise((resolve, reject) => {
    const metricsData = {};

    const promises = rootDirectories.map((rootDir) => {
      return traverseDirectory(rootDir, (relativeFilePath, filePath) => {
        if (!metricsData[relativeFilePath]) {
          metricsData[relativeFilePath] = {};
        }
        metricsData[relativeFilePath][rootDir] =
          extractLighthouseMetrics(filePath);
      });
    });

    Promise.all(promises)
      .then(() => resolve(metricsData))
      .catch(reject);
  });
}

function sanitizeSheetName(name) {
  return name.replace(/[:\\\/?*\[\]]/g, "_");
}

function createExcelTable(metricsData, rootDirectories) {
  const workbook = xlsx.utils.book_new();

  for (const [relativeFilePath, metricsByRoot] of Object.entries(metricsData)) {
    const sanitizedSheetName = sanitizeSheetName(relativeFilePath);
    const worksheet = xlsx.utils.aoa_to_sheet([
      ["Metric", ...rootDirectories.map((dir) => path.basename(dir))],
    ]);

    const metricNames = Object.keys(metricsByRoot[rootDirectories[0]]); // Assuming all root directories have the same metrics

    metricNames.forEach((metricName) => {
      const rowData = [metricName];
      rootDirectories.forEach((rootDir) => {
        const metrics = metricsByRoot[rootDir];
        rowData.push(metrics[metricName]);
      });
      xlsx.utils.sheet_add_aoa(worksheet, [rowData], { origin: -1 });
    });

    xlsx.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
  }

  return workbook;
}

// Get the root directories from the command-line arguments
const rootDirectories = process.argv.slice(2);

if (rootDirectories.length < 2) {
  console.error("Please provide at least two root directories as arguments.");
  process.exit(1);
}

collectMetrics(rootDirectories)
  .then((metricsData) => {
    const excelWorkbook = createExcelTable(metricsData, rootDirectories);
    xlsx.writeFile(excelWorkbook, "metrics.xlsx");
    console.log("Excel file generated successfully.");
  })
  .catch((err) => {
    console.error("Error collecting metrics:", err);
    process.exit(1);
  });
