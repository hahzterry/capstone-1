import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import { HomeCard } from "./components/HomeCard";
import { TokenizeForm } from "./components/TokenizeForm";
import { TxBanner, type TxState } from "./components/TxBanner";
import { WalletBar } from "./components/WalletBar";
import { arcChain, addressUrl } from "./lib/chain";
import {
  getWalletClient,
  hasWallet,
  publicClient,
} from "./lib/clients";
import {
  homeRegistry,
  homeRegistryAddress,
  isDeployed,
} from "./lib/contract";
import type { Home, HomeView } from "./lib/contract";
import { readableError } from "./lib/errors";
import { parseUsdc } from "./lib/format";
export default function App() {
  const [account, setAccount] = useState<Address>();
  const [chainId, setChainId] = useState<number>();
  const [balance, setBalance] = useState<bigint>();
  const [homes, setHomes] = useState<HomeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const [filter, setFilter] = useState("");
  const [tx, setTx] = useState<TxState>({ status: "idle" });
  const busy = tx.status === "pending";
  const onArc = chainId === arcChain.id;
  const canWrite =
    Boolean(account) &&
    onArc &&
    isDeployed &&
    !busy;
  /**
   * Load every home from HomeRegistry.
   */
  const loadHomes = useCallback(async () => {
    if (!isDeployed) {
      setHomes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(undefined);
    try {
      const count = await publicClient.readContract({
        ...homeRegistry,
        functionName: "homeCount",
      });
      const homeCount = Number(count);
      if (homeCount === 0) {
        setHomes([]);
        return;
      }
      const ids = Array.from(
        { length: homeCount },
        (_, index) => BigInt(index + 1),
      );
      const loaded = await Promise.all(
        ids.map(async (id): Promise<HomeView> => {
          const result = await publicClient.readContract({
            ...homeRegistry,
            functionName: "getHome",
            args: [id],
          });
          /**
           * Viem returns Solidity tuples as readonly arrays.
           *
           * Convert the tuple into the application's Home
           * object explicitly instead of using an unsafe cast.
           */
          const [
            owner,
            leaseEnd,
            forSale,
            forRent,
            tenant,
            salePrice,
            rentPrice,
            name,
            location,
            threeWordAddress,
            metadataURI,
            tiktokURL,
          ] = result;
          const home: Home = {
            owner,
            leaseEnd,
            forSale,
            forRent,
            tenant,
            salePrice,
            rentPrice,
            name,
            location,
            threeWordAddress,
            metadataURI,
            tiktokURL,
          };
          return {
            id,
            ...home,
          };
        }),
      );
      setHomes(loaded.reverse());
    } catch (error) {
      setLoadError(readableError(error));
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * Read the connected wallet's native USDC balance.
   *
   * Arc uses native USDC for gas/payment on the configured
   * Arc network.
   */
  const refreshBalance = useCallback(async () => {
    if (!account || !onArc) {
      setBalance(undefined);
      return;
    }
    try {
      const nextBalance = await publicClient.getBalance({
        address: account,
      });
      setBalance(nextBalance);
    } catch {
      setBalance(undefined);
    }
  }, [account, onArc]);
  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);
  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);
  /**
   * Follow an already-connected injected wallet.
   */
  useEffect(() => {
    if (!hasWallet()) return;
    const wallet = getWalletClient();
    void wallet
      .getAddresses()
      .then(([first]) => {
        setAccount(first);
      })
      .catch(() => {
        setAccount(undefined);
      });
    void wallet
      .getChainId()
      .then(setChainId)
      .catch(() => {
        setChainId(undefined);
      });
    const provider = window.ethereum;
    if (!provider) return;
    const onAccounts = (accounts: Address[]) => {
      setAccount(accounts[0]);
    };
    const onChain = (id: string) => {
      setChainId(Number.parseInt(id, 16));
    };
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener("accountsChanged", onAccounts);
      provider.removeListener("chainChanged", onChain);
    };
  }, []);
  async function connect() {
    try {
      const wallet = getWalletClient();
      const [address] = await wallet.requestAddresses();
      setAccount(address);
      const nextChainId = await wallet.getChainId();
      setChainId(nextChainId);
      if (nextChainId !== arcChain.id) {
        await switchToArc();
      }
    } catch (error) {
      setTx({
        status: "error",
        label: "Connecting a wallet",
        message: readableError(error),
      });
    }
  }
  async function switchToArc() {
    try {
      const wallet = getWalletClient();
      try {
        await wallet.switchChain({
          id: arcChain.id,
        });
      } catch {
        /*
         * The wallet does not know Arc yet.
         * Add the currently configured Arc network,
         * then switch to it.
         */
        await wallet.addChain({
          chain: arcChain,
        });
        await wallet.switchChain({
          id: arcChain.id,
        });
      }
      const nextChainId = await wallet.getChainId();
      setChainId(nextChainId);
    } catch (error) {
      setTx({
        status: "error",
        label: `Switching to ${arcChain.name}`,
        message: readableError(error),
      });
    }
  }
  /**
   * Execute a wallet transaction, wait for confirmation,
   * refresh the property list and wallet balance.
   */
  async function send(
    label: string,
    run: (from: Address) => Promise<Hash>,
  ) {
    if (!account) {
      setTx({
        status: "error",
        label,
        message: "Connect your wallet first.",
      });
      return;
    }
    if (!onArc) {
      setTx({
        status: "error",
        label,
        message: `Switch your wallet to ${arcChain.name} first.`,
      });
      return;
    }
    if (!isDeployed) {
      setTx({
        status: "error",
        label,
        message: "HomeRegistry is not configured.",
      });
      return;
    }
    setTx({
      status: "pending",
      label,
    });
    try {
      const hash = await run(account);
      setTx({
        status: "pending",
        label,
        hash,
      });
      const receipt =
        await publicClient.waitForTransactionReceipt({
          hash,
        });
      if (receipt.status !== "success") {
        setTx({
          status: "error",
          label,
          message: "The transaction reverted on chain.",
          hash,
        });
        return;
      }
      setTx({
        status: "success",
        label,
        hash,
      });
      await Promise.all([
        loadHomes(),
        refreshBalance(),
      ]);
    } catch (error) {
      setTx({
        status: "error",
        label,
        message: readableError(error),
      });
    }
  }
  /**
   * Register a new home.
   *
   * The five values map directly to:
   *
   * name
   * location
   * threeWordAddress
   * metadataURI
   * tiktokURL
   */
  const tokenize = (
    name: string,
    location: string,
    threeWordAddress: string,
    metadataURI: string,
    tiktokURL: string,
  ) =>
    send(`Registering "${name}"`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "tokenizeHome",
          args: [
            name,
            location,
            threeWordAddress,
            metadataURI,
            tiktokURL,
          ],
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const listForSale = (
    id: bigint,
    price: string,
  ) =>
    send(`Listing home #${id} for sale`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "listForSale",
          args: [id, parseUsdc(price)],
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const listForRent = (
    id: bigint,
    price: string,
  ) =>
    send(`Listing home #${id} for rent`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "listForRent",
          args: [id, parseUsdc(price)],
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const delist = (id: bigint) =>
    send(`Delisting home #${id}`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "delist",
          args: [id],
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const buy = (home: HomeView) =>
    send(`Buying home #${home.id}`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "buy",
          args: [home.id],
          value: home.salePrice,
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const rent = (home: HomeView) =>
    send(`Renting home #${home.id}`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "rent",
          args: [home.id],
          value: home.rentPrice,
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const payRent = (home: HomeView) =>
    send(
      `Paying rent on home #${home.id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "payRent",
            args: [home.id],
            value: home.rentPrice,
            account: from,
          });
        return getWalletClient().writeContract(request);
      },
    );
  const endLease = (id: bigint) =>
    send(`Ending the lease on home #${id}`, async (from) => {
      const { request } =
        await publicClient.simulateContract({
          ...homeRegistry,
          functionName: "endLease",
          args: [id],
          account: from,
        });
      return getWalletClient().writeContract(request);
    });
  const visible = useMemo(() => {
    const query = filter.trim();
    if (!query) {
      return homes;
    }
    if (/^\d+$/.test(query)) {
      return homes.filter(
        (home) => home.id === BigInt(query),
      );
    }
    const needle = query.toLowerCase();
    return homes.filter(
      (home) =>
        home.name.toLowerCase().includes(needle) ||
        home.location.toLowerCase().includes(needle) ||
        home.threeWordAddress
          .toLowerCase()
          .includes(needle),
    );
  }, [homes, filter]);
  /**
   * The wallet bar's Add Funds button is intentionally kept
   * as a UI hook until the Circle session endpoint is wired
   * to the exact installed Circle SDK version.
   */
  const addFunds = useCallback(() => {
    setTx({
      status: "error",
      label: "Add funds",
      message:
        "Funding is not configured yet. Connect Circle Onramp before using Add Funds.",
    });
  }, []);
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Home RWA</h1>
          <p className="subtitle">
            Discover homes through video. Rent or buy directly on Arc.
          </p>
        </div>
        <WalletBar
          account={account}
          balance={balance}
          chainId={chainId}
          busy={busy}
          onConnect={connect}
          onSwitchChain={switchToArc}
          onAddFunds={addFunds}
        />
      </header>
      <TxBanner tx={tx} />
      {!isDeployed && (
        <div className="banner error">
          <span>
            Set VITE_HOME_REGISTRY_ADDRESS in ui/.env,
            then restart the dev server.
          </span>
        </div>
      )}
      {isDeployed && (
        <div className="network-info">
          <span>{arcChain.name}</span>
          <span className="mono">
            {homeRegistryAddress}
          </span>
        </div>
      )}
      {!hasWallet() && (
        <div className="banner error">
          <span>
            No injected wallet detected. Install MetaMask
            or another compatible browser wallet to send
            transactions.
          </span>
        </div>
      )}
      {account && !onArc && (
        <div className="banner error">
          <span>
            Your wallet is connected to another network.
            Switch to {arcChain.name} to continue.
          </span>
          <button
            className="primary"
            type="button"
            onClick={switchToArc}
            disabled={busy}
          >
            Switch to {arcChain.name}
          </button>
        </div>
      )}
      <TokenizeForm
        disabled={!canWrite}
        onSubmit={tokenize}
      />
      <section className="listing">
        <div className="listing-head">
          <div>
            <h2>Homes</h2>
            <p className="hint">
              Browse homes by location, 3 Word Address,
              or home ID.
            </p>
          </div>
          <input
            className="filter"
            placeholder="Search homes, locations or 3 Word Address"
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          />
        </div>
        {loading && (
          <p className="empty">
            Loading homes from {arcChain.name}...
          </p>
        )}
        {loadError && (
          <p className="empty">
            Could not read HomeRegistry: {loadError}
          </p>
        )}
        {!loading &&
          !loadError &&
          homes.length === 0 && (
            <p className="empty">
              No homes yet. Register the first one above.
            </p>
          )}
        {!loading &&
          homes.length > 0 &&
          visible.length === 0 && (
            <p className="empty">
              Nothing matches "{filter}".
            </p>
          )}
        {visible.map((home) => (
          <HomeCard
            key={home.id.toString()}
            home={home}
            account={account}
            busy={busy || !canWrite}
            onListForSale={listForSale}
            onListForRent={listForRent}
            onDelist={delist}
            onBuy={buy}
            onRent={rent}
            onPayRent={payRent}
            onEndLease={endLease}
          />
        ))}
      </section>
      <footer>
        <p>
          Home RWA records are not legal title to real
          property. Always verify property information
          independently.
        </p>
        {isDeployed && (
          <p>
            HomeRegistry:{" "}
            <a
              href={addressUrl(homeRegistryAddress)}
              target="_blank"
              rel="noreferrer"
            >
              {homeRegistryAddress}
            </a>
          </p>
        )}
      </footer>
    </div>
  );
}
