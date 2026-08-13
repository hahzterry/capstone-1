# Home RWA

Capstone for module 04. An on-chain property desk on Arc Testnet: tokenize a home, list
it for sale or for rent, buy it, rent it, pay rent. Payments are native USDC.

- [SPEC.md](SPEC.md) — roles, state flow, what is out of scope
- [DEPLOYMENT.md](DEPLOYMENT.md) — deployed address, transactions, compiler settings
- [RETROSPECTIVE.md](RETROSPECTIVE.md) — what stands between this and mainnet

```
contracts/   Foundry: HomeRegistry.sol, tests, deploy script
ui/          Vite + TypeScript + viem dApp
```

## Contract

forge-std is a submodule, so clone with `--recursive` (or run `git submodule update
--init` in an existing clone), then:

```bash
cd contracts && forge test -vv
```

Deploying needs a throwaway key with testnet USDC from https://faucet.circle.com.
Copy `.env.example` to `.env` and fill in `PRIVATE_KEY`, then:

```bash
cd contracts && set -a && . ../.env && set +a && forge script script/DeployHomeRegistry.s.sol:DeployHomeRegistry --rpc-url $ARC_TESTNET_RPC_URL --broadcast
```

## UI

Put the deployed address in `ui/.env` as `VITE_HOME_REGISTRY_ADDRESS`, then:

```bash
cd ui && npm install && npm run dev
```

The app connects an injected wallet, offers to add or switch to Arc Testnet, and drives
every contract action from the browser.

## A note on what this is

An entry in this contract is a row with an owner attached. It is not legal title to any
property, and the contract cannot check the metadata against anything in the real world.
