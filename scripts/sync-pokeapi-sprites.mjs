#!/usr/bin/env node
/**
 * Sync app-friendly PokeAPI sprites into public/assets.
 *
 * Usage:
 *   node scripts/sync-pokeapi-sprites.mjs
 *   node scripts/sync-pokeapi-sprites.mjs --max-id=151
 *   node scripts/sync-pokeapi-sprites.mjs --skip-items
 *
 * Uses Node's built-in fetch; no third-party dependencies are required.
 * This is an explicit local task, not a build/postinstall hook.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master";
const API = "https://api.github.com/repos/PokeAPI/sprites/contents";
const maxArg = process.argv.find((arg) => arg.startsWith("--max-id="));
const maxId = maxArg ? Number(maxArg.split("=")[1]) : 151;
const skipItems = process.argv.includes("--skip-items");

if (!Number.isInteger(maxId) || maxId < 1 || maxId > 20000) {
  throw new Error("--max-id must be an integer between 1 and 20000");
}

const headers = { "User-Agent": "neongenesis-pokemon-asistente-assets-sync" };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(url, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers });
      if (response.status === 404) return false;
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
      await writeFile(destination, new Uint8Array(await response.arrayBuffer()));
      return true;
    } catch (error) {
      if (attempt === 3) {
        console.warn(`WARN: ${error.message}`);
        return false;
      }
      await sleep(attempt * 500);
    }
  }
  return false;
}

async function syncPokemon() {
  const jobs = [];
  for (let id = 1; id <= maxId; id += 1) {
    jobs.push({
      url: `${BASE}/sprites/pokemon/other/official-artwork/${id}.png`,
      path: `public/assets/pokemon/artwork/${id}.png`,
    });
    jobs.push({
      url: `${BASE}/sprites/pokemon/${id}.png`,
      path: `public/assets/pokemon/sprites/${id}.png`,
    });
  }
  return runPool(jobs, 12);
}

async function syncItems() {
  const response = await fetch(`${API}/sprites/items?ref=master`, { headers });
  if (!response.ok) throw new Error(`Could not list item sprites: HTTP ${response.status}`);
  const entries = await response.json();
  const jobs = entries
    .filter((entry) => entry.type === "file" && /\.png$/i.test(entry.name))
    .map((entry) => ({
      url: entry.download_url,
      path: `public/assets/items/${entry.name}`,
    }));
  return runPool(jobs, 10);
}

async function runPool(jobs, concurrency) {
  let next = 0;
  let completed = 0;
  let downloaded = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (true) {
      const index = next++;
      if (index >= jobs.length) return;
      if (await download(jobs[index].url, path.join(ROOT, jobs[index].path))) {
        downloaded += 1;
      }
      completed += 1;
      if (completed % 100 === 0 || completed === jobs.length) {
        process.stdout.write(`\rProcessed ${completed}/${jobs.length} (downloaded ${downloaded})`);
      }
    }
  });
  await Promise.all(workers);
  if (jobs.length) process.stdout.write("\n");
  return { requested: jobs.length, downloaded };
}

async function main() {
  console.log(`Syncing Pokémon sprites (IDs 1–${maxId})...`);
  const pokemon = await syncPokemon();
  let items = { requested: 0, downloaded: 0 };
  if (!skipItems) {
    console.log("Syncing item sprites...");
    items = await syncItems();
  }

  const licenseResponse = await fetch(`${BASE}/LICENCE.txt`, { headers });
  if (licenseResponse.ok) {
    const licensePath = path.join(ROOT, "public/assets/POKEAPI-SPRITES-LICENCE.txt");
    await mkdir(path.dirname(licensePath), { recursive: true });
    await writeFile(licensePath, await licenseResponse.text(), "utf8");
  } else {
    console.warn(`WARN: could not fetch upstream license (${licenseResponse.status})`);
  }

  console.log("\nSync summary:");
  console.log(`  Pokémon assets: ${pokemon.downloaded}/${pokemon.requested} downloaded`);
  console.log(`  Item assets:    ${items.downloaded}/${items.requested} downloaded`);
  console.log("  Destination:    public/assets/");
  console.log("Review asset count and repository size before committing the downloaded files.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
