# PokeAPI sprites in NeoGénesis

Source repository: https://github.com/PokeAPI/sprites  
Upstream licence file: https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt

## Local asset layout

Run `node scripts/sync-pokeapi-sprites.mjs` from the project root. The script uses Node's built-in `fetch`; no dependency installation is needed.

```text
public/assets/
├── POKEAPI-SPRITES-LICENCE.txt
├── pokemon/
│   ├── artwork/       # larger artwork, named by Pokédex ID
│   │   └── 25.png
│   └── sprites/       # compact default sprites, named by Pokédex ID
│       └── 25.png
└── items/             # item images, retaining upstream filenames
    └── poke-ball.png
```

Example paths usable by the app:

- `/assets/pokemon/artwork/25.png`
- `/assets/pokemon/sprites/25.png`
- `/assets/items/poke-ball.png`

The default sync checks Pokédex IDs 1–1025, skips files that do not exist, and downloads item images. To sync only Pokémon images, use `node scripts/sync-pokeapi-sprites.mjs --skip-items`. To limit the range, use `node scripts/sync-pokeapi-sprites.mjs --max-id=151`.

## How to use the assets

- Prefer **artwork** for Pokémon detail cards, the Pokédex and selected Pokémon profiles.
- Prefer **sprites** for compact party/PC rows, combat lists and small selectors.
- Use item PNGs for the shop, inventory and held-item UI.
- The Pokédex ID is the stable filename key; keep the species name and campaign-specific captured Pokémon instance in application data rather than duplicating image files.
- Keep user-uploaded/custom images in Supabase Storage, not in this static asset collection.

## Important

The sync script is deliberately **not** wired into `npm run build` or `postinstall`: downloading thousands of images during every Vercel build would be slow and unpredictable. Run it explicitly, inspect the output, and decide whether to commit the generated assets or store them elsewhere before deploying.

The upstream licence file states CC0 for the repository, while also noting Pokémon Company copyright for image contents. Keep the licence file with the assets and review applicable rights before using or redistributing them publicly, especially in a commercial context.
