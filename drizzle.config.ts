import { defineConfig } from "drizzle-kit"
import { readFileSync, existsSync } from "fs"

// Load environment variables from .env.local for local development
if (existsSync(".env.local")) {
  const envContent = readFileSync(".env.local", "utf-8")
  envContent.split("\n").forEach((line) => {
    const [key, ...valueParts] = line.split("=")
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").replace(/^["']|["']$/g, "").trim()
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value
      }
    }
  })
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
