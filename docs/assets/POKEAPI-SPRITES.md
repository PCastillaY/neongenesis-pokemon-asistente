# PokeAPI sprites in NeoGénesis

Source repository: https://github.com/PokeAPI/sprites  
Upstream licence and copyright statement: https://github.com/PokeAPI/sprites/blob/master/LICENCE.txt

## Copyright reference

**All image contents are Copyright The Pokémon Company.** The upstream repository states that the repository is distributed under CC0 1.0 Universal; that statement should not be interpreted as transferring or extinguishing rights owned by The Pokémon Company. This attribution is documented here in GitHub only; it is not intended to add a copyright banner or attribution element to the application UI. This notice is an attribution reference, not a guarantee that every intended use is legally authorized. Review the rights applicable to the planned distribution and use.

## Local asset layout

Run `node scripts/sync-pokeapi-sprites.mjs` from the project root. The script uses Node's built-in `fetch`; no dependency installation is needed.

```text
public/assets/
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

The default sync checks Pokédex IDs 1–151, skips files that do not exist, and downloads item images. The upstream licence text is saved under `docs/assets/POKEAPI-SPRITES-LICENCE.txt`, in GitHub documentation rather than the app’s public asset directory. To sync only Pokémon images, use `node scripts/sync-pokeapi-sprites.mjs --skip-items`. To limit the range, use `node scripts/sync-pokeapi-sprites.mjs --max-id=25`.

## How to use the assets

- Prefer **artwork** for Pokémon detail cards, the Pokédex and selected Pokémon profiles.
- Prefer **sprites** for compact party/PC rows, combat lists and small selectors.
- Use item PNGs for the shop, inventory and held-item UI.
- The Pokédex ID is the stable filename key; keep the species name and campaign-specific captured Pokémon instance in application data rather than duplicating image files.
- Keep user-uploaded/custom images in Supabase Storage, not in this static asset collection.

## Download and deployment

The sync script is deliberately **not** wired into `npm run build` or `postinstall`: downloading images during every Vercel build would be unnecessary. Run it explicitly, inspect the output, and decide whether to commit the generated assets or store them elsewhere before deploying.
