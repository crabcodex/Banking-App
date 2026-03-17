import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/**/customerProjectionSchema.ts",
  out: "./drizzle",
  dialect: "postgresql",
});