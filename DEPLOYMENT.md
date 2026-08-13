# Deployment

## Network

| | |
|---|---|
| Chain | Arc Testnet |
| Chain id | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | https://testnet.arcscan.app |
| Gas / payment token | native USDC, 18 decimals |

## Contract

| | |
|---|---|
| `HomeRegistry` | [`0xdB49dD8C5892705432f9fdb39bCef5906Fb4c4B3`](https://testnet.arcscan.app/address/0xdB49dD8C5892705432f9fdb39bCef5906Fb4c4B3) |
| Deploy tx | [`0x920691...631999`](https://testnet.arcscan.app/tx/0x920691262d2e1bc459b8cc19a61d7dadf2b7eb3817df016e275c84a1e1631999) |
| Block | 56838745 |
| Gas used | 1,030,976 |
| Deployer | `0xF982CE44972512e59B17Eb62E888AD31Aef6E5A0` |
| Source | verified on Arcscan |

## Compiler settings

| | |
|---|---|
| solc | `v0.8.24+commit.e11b9ed9` |
| EVM version | `paris` |
| Optimizer | enabled, 200 runs |
| License | MIT |

These live in `contracts/foundry.toml`, so a plain `forge build` reproduces the deployed
bytecode.

## Commands

Deploy:

```bash
cd contracts && set -a && . ../.env && set +a
forge script script/DeployHomeRegistry.s.sol:DeployHomeRegistry \
  --rpc-url "$ARC_TESTNET_RPC_URL" --broadcast
```

Verify:

```bash
forge verify-contract 0xdB49dD8C5892705432f9fdb39bCef5906Fb4c4B3 \
  src/HomeRegistry.sol:HomeRegistry \
  --verifier blockscout \
  --verifier-url https://testnet.arcscan.app/api/ \
  --chain 5042002 \
  --compiler-version "v0.8.24+commit.e11b9ed9" \
  --num-of-optimizations 200 \
  --evm-version paris --watch
```

Arcscan rejects the short `0.8.24` form of `--compiler-version`; it wants the full
version with the commit hash.

## UI

`ui/.env`:

```
VITE_HOME_REGISTRY_ADDRESS=0xdB49dD8C5892705432f9fdb39bCef5906Fb4c4B3
```

## Demo run on Arc

The full flow from the brief, executed against the deployed contract. Home 1 goes all the
way through: tokenized, rented, rent paid, lease ended, sold.

| Step | Tx |
|---|---|
| tokenize home 1 | [`0x6eba16...3da6bc`](https://testnet.arcscan.app/tx/0x6eba16adf2706472b85ff330605a1b668d8ff5fcaa90320160945106303da6bc) |
| list 1 for rent, 1 USDC | [`0x1d7b86...ebc685`](https://testnet.arcscan.app/tx/0x1d7b8616fe7b29a1cf232235f11a64ccc725509bfae2f4e1c1445a7a77ebc685) |
| tenant rents 1 | [`0xa9999a...05db97`](https://testnet.arcscan.app/tx/0xa9999a06a689be03afa658b1486ed1e0fc1f8084a9bf60b3c9c9c2ddf105db97) |
| tenant pays rent, extends | [`0x8e32dd...28f1bc`](https://testnet.arcscan.app/tx/0x8e32ddf63a7f3ac42c1d647ead0e1facaa4aac5fcbb72de46941febdf128f1bc) |
| tenant ends lease | [`0x53bdf4...34d6d73`](https://testnet.arcscan.app/tx/0x53bdf470e329cd824c1fa5067c83bd04d592566c3dc7c1ab13d729d3734d6d73) |
| list 1 for sale, 10 USDC | [`0xb216a9...885acd`](https://testnet.arcscan.app/tx/0xb216a98464c849992ed9bbf203bd692036145167a5b422a20671a95a18885acd) |
| buyer buys 1 | [`0x16c15a...8fb099`](https://testnet.arcscan.app/tx/0x16c15a609717df3b0db6d86c78f8fedf95a7fd7f3857ddbe0ab9c19c078fb099) |
| tokenize home 2, list, rent | [`0xacee02...0eb6f8`](https://testnet.arcscan.app/tx/0xacee029298c5fcf38a3c967778dd96adeccc6a3208bebcee7b362410030eb6f8), [`0x6c2fff...5f2c0b`](https://testnet.arcscan.app/tx/0x6c2fff809f34649cbd9142dc64f090fbb26cdb1962974c41d8709bff7a5f2c0b), [`0x68e141...4479e8`](https://testnet.arcscan.app/tx/0x68e14156b07c1781df1fe7c42fce43756f9c187d85207f72465df9f6464479e8) |
| tokenize home 3, list for sale | [`0xf568e8...0486bf`](https://testnet.arcscan.app/tx/0xf568e864b430c4e0916046985b4f3dae7412088fa82589e8f8d8b7fd4f0486bf), [`0x673d33...2d48b49`](https://testnet.arcscan.app/tx/0x673d336fd57715bbb5ecc9eaeff0bfe3496349da0e1cde33ffd5041962d48b49) |

Resulting state, left in place so the UI has something to show:

- **1 Sea view flat** — owned by the buyer, not listed
- **2 Garden duplex** — leased, 2 USDC per 30 days
- **3 Loft on the hill** — for sale, 15 USDC

All three accounts are throwaway testnet keys funded from the Circle faucet.
