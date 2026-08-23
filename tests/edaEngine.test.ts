import assert from "node:assert/strict";
import test from "node:test";
import { computeCorrelations, computeMetadata, computeOutliers, parseCSV } from "../src/utils/edaEngine.ts";

test("parseCSV preserves headers and normalizes missing cells", () => {
  const result = parseCSV("name,score\nAda,10\nGrace,");

  assert.deepEqual(result.headers, ["name", "score"]);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[1].score, null);
});

test("computeMetadata counts numerical, categorical, and missing values", () => {
  const rows = [
    { name: "Ada", score: 10, active: true },
    { name: "Grace", score: null, active: false },
  ];
  const metadata = computeMetadata("Test data", ["name", "score", "active"], rows);

  assert.equal(metadata.numRows, 2);
  assert.equal(metadata.numColumns, 3);
  assert.equal(metadata.totalNullCells, 1);
  assert.deepEqual(metadata.numericalColumns, ["score"]);
  assert.deepEqual(metadata.categoricalColumns, ["name", "active"]);
});

test("computeCorrelations and computeOutliers analyze numerical columns", () => {
  const rows = [
    { first: 1, second: 2 },
    { first: 2, second: 4 },
    { first: 3, second: 6 },
    { first: 100, second: 200 },
  ];
  const correlations = computeCorrelations(["first", "second"], rows, "pearson");
  const outliers = computeOutliers(["first"], rows, 1.5, 3);

  assert.equal(correlations.pairs[0].feature1, "first");
  assert.equal(correlations.pairs[0].feature2, "second");
  assert.equal(correlations.pairs[0].r, 1);
  assert.equal(outliers[0].feature, "first");
  assert.ok(outliers[0].iqrCount > 0);
});
