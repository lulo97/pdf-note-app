import express from "express";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------
// Logger Helper
// ----------------------------
const log = (...args) => {
  console.log(new Date().toISOString(), "-", ...args);
};

const errorLog = (...args) => {
  console.error("❌", new Date().toISOString(), "-", ...args);
};

// ----------------------------
// Log Every Request
// ----------------------------
app.use((req, res, next) => {
  log(`[${req.method}] ${req.url}`);
  next();
});

// ----------------------------
// Fix __dirname for ES modules
// ----------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------
// Load schema.json
// ----------------------------
let table_name;
let columns;

try {
  const schema = JSON.parse(
    fs.readFileSync(path.join(__dirname, "schema.json"), "utf-8"),
  );

  table_name = schema.table_name;
  columns = schema.columns;

  if (!table_name || !columns || !Array.isArray(columns)) {
    throw new Error("Invalid schema.json format");
  }

  log("Schema loaded:", table_name);
} catch (err) {
  errorLog("Schema loading failed:", err);
  process.exit(1);
}

// ----------------------------
// SQLite
// ----------------------------
let db;
try {
  db = new DatabaseSync(path.join(__dirname, "database.db"));
  log("Database connected.");
} catch (err) {
  errorLog("Database connection failed:", err);
  process.exit(1);
}

// ----------------------------
// Create Table
// ----------------------------
try {
  const columnDefinitions = columns
    .map((col) =>
      col === "id" ? "id INTEGER PRIMARY KEY AUTOINCREMENT" : `${col} TEXT`,
    )
    .join(", ");

  db.exec(`
    CREATE TABLE IF NOT EXISTS ${table_name} (
      ${columnDefinitions}
    );
  `);

  log(`Table "${table_name}" ready.`);
} catch (err) {
  errorLog("Table creation failed:", err);
  process.exit(1);
}

// ============================
// REST API ROUTES
// ============================

// GET ALL
app.get(`/${table_name}`, (req, res, next) => {
  try {
    log("Fetching all records...");
    const stmt = db.prepare(`SELECT * FROM ${table_name}`);
    const data = stmt.all();
    res.json(data);
  } catch (err) {
    errorLog("GET ALL failed:", err);
    next(err);
  }
});

// GET BY ID
app.get(`/${table_name}/:id`, (req, res, next) => {
  try {
    log("Fetching record id:", req.params.id);

    const stmt = db.prepare(`SELECT * FROM ${table_name} WHERE id = ?`);

    const row = stmt.get(req.params.id);

    if (!row) {
      log("Record not found:", req.params.id);
      return res.status(404).json({ error: "Not found" });
    }

    res.json(row);
  } catch (err) {
    errorLog("GET BY ID failed:", err);
    next(err);
  }
});

// POST
app.post(`/${table_name}`, (req, res, next) => {
  try {
    log("Creating record:", req.body);

    const data = req.body;
    const insertCols = columns.filter((c) => c !== "id");
    const placeholders = insertCols.map(() => "?").join(", ");

    const stmt = db.prepare(`
      INSERT INTO ${table_name} (${insertCols.join(", ")})
      VALUES (${placeholders})
    `);

    const values = insertCols.map((col) =>
      col === "createdat" || col === "updatedat"
        ? new Date().toISOString()
        : (data[col] ?? null),
    );

    const result = stmt.run(...values);

    log("Record created with id:", result.lastInsertRowid);

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    errorLog("POST failed:", err);
    next(err);
  }
});

// PUT
app.put(`/${table_name}/:id`, (req, res, next) => {
  try {
    log("Updating record id:", req.params.id);

    const id = req.params.id;
    const data = req.body;

    const updateCols = columns.filter((c) => c !== "id");
    const setClause = updateCols.map((col) => `${col} = ?`).join(", ");

    const stmt = db.prepare(`
      UPDATE ${table_name}
      SET ${setClause}
      WHERE id = ?
    `);

    const values = updateCols.map((col) =>
      col === "updatedat" ? new Date().toISOString() : (data[col] ?? null),
    );

    const result = stmt.run(...values, id);

    if (result.changes === 0) {
      log("Update failed — record not found:", id);
      return res.status(404).json({ error: "Not found" });
    }

    log("Record updated:", id);

    res.json({ updated: true });
  } catch (err) {
    errorLog("PUT failed:", err);
    next(err);
  }
});

// DELETE
app.delete(`/${table_name}/:id`, (req, res, next) => {
  try {
    log("Deleting record id:", req.params.id);

    const stmt = db.prepare(`DELETE FROM ${table_name} WHERE id = ?`);

    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      log("Delete failed — record not found:", req.params.id);
      return res.status(404).json({ error: "Not found" });
    }

    log("Record deleted:", req.params.id);

    res.json({ deleted: true });
  } catch (err) {
    errorLog("DELETE failed:", err);
    next(err);
  }
});

// ============================
// GLOBAL ERROR HANDLER
// ============================
app.use((err, req, res, next) => {
  errorLog("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// ============================
// START SERVER
// ============================
const PORT = 3000;
app.listen(PORT, () => {
  log(`Server running at http://localhost:${PORT}`);
});
