import express from "express";
import indexRoute from "./route/index.js";
import path from "path";
import { connectdb } from "../src/config/dbConfig.js";
import { fileURLToPath } from "url";
import { createResponseHandler } from "smart-response";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT;

connectdb();

app.use(express.json());
app.use(createResponseHandler());
app.use(express.static(path.join(__dirname, "public")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/api", indexRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server start on port ${port}`);
});
