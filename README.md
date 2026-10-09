# TrojanCoins

Launch a meme coin on pump.fun that hatches into a different meme when it reaches the market cap you set.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/
```

Optional environment variables (`.env`):

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of your backend. Leave empty to use the built-in sample data. |
| `VITE_RPC_URL` | Solana RPC endpoint (defaults to the public mainnet-beta endpoint; use your own for production). |

## Where to plug in the backend

Everything the UI shows comes through **`src/lib/api.js`**. Each function has a clear return shape.
`src/lib/data.js` holds the sample records that stand in until a backend exists.

| Function | Expected data |
| --- | --- |
| `listTokens()` | Array of coins. `status: 'sealed' \| 'hatched'`. A hatched coin carries `reveal: { name, ticker, desc, image }` and `hatchedAt`. |
| `getToken(id)` | One coin, or `null`. |
| `listUnveilings()` | Hatched coins, newest first. |
| `listHeroes()` | Leaderboard rows `{ rank, name, launched, hatches, bestMultiple }`. |
| `registerLaunch(launch)` | Called after the pump.fun transaction confirms. Store the coin and its `target` market cap here. |
| `subscribe(cb)` | Live market-cap updates. Replace the interval with a websocket. |

A sealed coin never exposes its next identity to the client. The hatch logic (choosing the new meme, swapping
the metadata, detecting that `mcap >= target`) lives entirely server-side.

## Wallet and launch

* `src/lib/wallet.js`: Phantom connect, disconnect, account changes, SOL balance.
* `src/lib/pumpfun.js`: uploads art + metadata to pump.fun IPFS, builds the create transaction with
  PumpPortal's `trade-local` API, co-signs with the fresh mint key and sends it through Phantom.

## Design system

Tokens live in `src/styles/tokens.css` (colour, type scale, 4px spacing, three radius tiers, elevation, motion).
Display type is Bricolage Grotesque (condensed, heavy); text is Figtree.

The 3D horse is built procedurally in `src/lib/horse.js`. Any element with `data-horse-stage` becomes a
place the single WebGL horse can stand; `data-speed`, `data-hatch` and `data-fit` tune its behaviour there.
