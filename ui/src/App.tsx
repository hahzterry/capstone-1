import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import { HomeCard } from "./components/HomeCard";
import { TokenizeForm } from "./components/TokenizeForm";
import { TxBanner, type TxState } from "./components/TxBanner";
import { WalletBar } from "./components/WalletBar";
import { arcTestnet } from "./lib/chain";
import { getWalletClient, hasWallet, publicClient } from "./lib/clients";
import { homeRegistry, homeRegistryAddress, isDeployed } from "./lib/contract";
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
  const onArc = chainId === arcTestnet.id;
  const canWrite = Boolean(account) && onArc && isDeployed;

  const loadHomes = useCallback(async () => {
    if (!isDeployed) {
      setLoading(false);
      return;
    }

    try {
      const count = await publicClient.readContract({
        ...homeRegistry,
        functionName: "homeCount",
      });

      const ids = Array.from({ length: Number(count) }, (_, index) => BigInt(index + 1));
      const loaded = await Promise.all(
        ids.map(async (id): Promise<HomeView> => {
          const home = (await publicClient.readContract({
            ...homeRegistry,
            functionName: "getHome",
            args: [id],
          })) as Home;
          return { id, ...home };
        }),
      );

      setHomes(loaded.reverse());
      setLoadError(undefined);
    } catch (error) {
      setLoadError(readableError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!account) return;
    setBalance(await publicClient.getBalance({ address: account }));
  }, [account]);

  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);

  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance, chainId]);

  // Pick up a wallet that is already connected, and follow it if the user switches
  // account or network from inside the extension.
  useEffect(() => {
    if (!hasWallet()) return;

    const wallet = getWalletClient();
    void wallet.getAddresses().then(([first]) => setAccount(first));
    void wallet.getChainId().then(setChainId);

    const provider = window.ethereum!;
    const onAccounts = (accounts: Address[]) => setAccount(accounts[0]);
    const onChain = (id: string) => setChainId(Number(id));

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
      setChainId(await wallet.getChainId());
    } catch (error) {
      setTx({ status: "error", label: "Connecting a wallet", message: readableError(error) });
    }
  }

  async function switchToArc() {
    try {
      const wallet = getWalletClient();
      try {
        await wallet.switchChain({ id: arcTestnet.id });
      } catch {
        // The wallet does not know Arc yet.
        await wallet.addChain({ chain: arcTestnet });
        await wallet.switchChain({ id: arcTestnet.id });
      }
      setChainId(await wallet.getChainId());
    } catch (error) {
      setTx({ status: "error", label: "Switching to Arc Testnet", message: readableError(error) });
    }
  }

  async function send(label: string, run: (from: Address) => Promise<Hash>) {
    if (!account) return;

    setTx({ status: "pending", label });
    try {
      const hash = await run(account);
      setTx({ status: "pending", label, hash });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        setTx({ status: "error", label, message: "The transaction reverted on chain." });
        return;
      }

      setTx({ status: "success", label, hash });
      await Promise.all([loadHomes(), refreshBalance()]);
    } catch (error) {
      setTx({ status: "error", label, message: readableError(error) });
    }
  }

  const tokenize = (name: string, location: string) =>
    send(`Tokenizing "${name}"`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "tokenizeHome",
        args: [name, location],
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const listForSale = (id: bigint, price: string) =>
    send(`Listing home #${id} for sale`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "listForSale",
        args: [id, parseUsdc(price)],
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const listForRent = (id: bigint, price: string) =>
    send(`Listing home #${id} for rent`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "listForRent",
        args: [id, parseUsdc(price)],
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const delist = (id: bigint) =>
    send(`Delisting home #${id}`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "delist",
        args: [id],
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const buy = (home: HomeView) =>
    send(`Buying home #${home.id}`, async (from) => {
      const { request } = await publicClient.simulateContract({
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
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "rent",
        args: [home.id],
        value: home.rentPrice,
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const payRent = (home: HomeView) =>
    send(`Paying rent on home #${home.id}`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "payRent",
        args: [home.id],
        value: home.rentPrice,
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const endLease = (id: bigint) =>
    send(`Ending the lease on home #${id}`, async (from) => {
      const { request } = await publicClient.simulateContract({
        ...homeRegistry,
        functionName: "endLease",
        args: [id],
        account: from,
      });
      return getWalletClient().writeContract(request);
    });

  const visible = useMemo(() => {
    const query = filter.trim();
    if (!query) return homes;
    if (/^\d+$/.test(query)) return homes.filter((home) => home.id === BigInt(query));

    const needle = query.toLowerCase();
    return homes.filter(
      (home) =>
        home.name.toLowerCase().includes(needle) || home.location.toLowerCase().includes(needle),
    );
  }, [homes, filter]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Home desk</h1>
          <p className="subtitle">Tokenize, sell and rent homes on Arc Testnet.</p>
        </div>
        <WalletBar
          account={account}
          balance={balance}
          chainId={chainId}
          busy={busy}
          onConnect={connect}
          onSwitchChain={switchToArc}
        />
      </header>

      <TxBanner tx={tx} />

      {!isDeployed && (
        <div className="banner error">
          <span>
            Set VITE_HOME_REGISTRY_ADDRESS in ui/.env to the address from DEPLOYMENT.md, then
            restart the dev server.
          </span>
        </div>
      )}

      {!hasWallet() && (
        <div className="banner error">
          <span>No injected wallet detected. Install MetaMask to send transactions.</span>
        </div>
      )}

      <TokenizeForm disabled={!canWrite || busy} onSubmit={tokenize} />

      <section className="listing">
        <div className="listing-head">
          <h2>Homes</h2>
          <input
            className="filter"
            placeholder="Filter by id, name or location"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>

        {loading && <p className="empty">Loading homes from Arc...</p>}
        {loadError && <p className="empty">Could not read the contract: {loadError}</p>}
        {!loading && !loadError && homes.length === 0 && (
          <p className="empty">No homes yet. Tokenize the first one above.</p>
        )}
        {!loading && homes.length > 0 && visible.length === 0 && (
          <p className="empty">Nothing matches "{filter}".</p>
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
          Records in this app are not legal title to any property. Contract{" "}
          {isDeployed ? homeRegistryAddress : "(not configured)"} on Arc Testnet.
        </p>
      </footer>
    </div>
  );
}
