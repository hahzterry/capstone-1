import { useCallback, useEffect, useMemo, useState } from "react";
import type { Address, Hash } from "viem";
import { HomeCard } from "./components/HomeCard";
import { TokenizeForm } from "./components/TokenizeForm";
import { TxBanner, type TxState } from "./components/TxBanner";
import { WalletBar } from "./components/WalletBar";
import { arcTestnet } from "./lib/chain";
import { getWalletClient, hasWallet, publicClient } from "./lib/clients";
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
  const [tx, setTx] = useState<TxState>({
    status: "idle",
  });
  const busy = tx.status === "pending";
  const onArc = chainId === arcTestnet.id;
  const canWrite =
    Boolean(account) &&
    onArc &&
    isDeployed &&
    hasWallet();
  /**
   * Load all homes.
   *
   * The new contract exposes nextHomeId()
   * instead of homeCount().
   */
  const loadHomes = useCallback(async () => {
    if (!isDeployed) {
      setHomes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const nextHomeId = await publicClient.readContract({
        ...homeRegistry,
        functionName: "nextHomeId",
      });
      const count = Number(nextHomeId) - 1;
      if (count <= 0) {
        setHomes([]);
        setLoadError(undefined);
        return;
      }
      const ids = Array.from(
        { length: count },
        (_, index) => BigInt(index + 1),
      );
      const loaded = await Promise.all(
        ids.map(async (id): Promise<HomeView> => {
          const home = (await publicClient.readContract({
            ...homeRegistry,
            functionName: "homes",
            args: [id],
          })) as Home;
          return {
            id,
            ...home,
          };
        }),
      );
      /**
       * Newest homes first.
       */
      setHomes(loaded.reverse());
      setLoadError(undefined);
    } catch (error) {
      setLoadError(readableError(error));
    } finally {
      setLoading(false);
    }
  }, []);
  /**
   * Refresh native USDC balance.
   *
   * Arc native USDC is represented by the native balance.
   */
  const refreshBalance = useCallback(async () => {
    if (!account) {
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
  }, [account]);
  useEffect(() => {
    void loadHomes();
  }, [loadHomes]);
  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance, chainId]);
  /**
   * Pick up an already connected wallet and listen
   * for account/network changes.
   */
  useEffect(() => {
    if (!hasWallet()) return;
    const wallet = getWalletClient();
    void wallet
      .getAddresses()
      .then(([first]) => {
        if (first) {
          setAccount(first);
        }
      });
    void wallet.getChainId().then(setChainId);
    const provider = window.ethereum!;
    const onAccounts = (accounts: Address[]) => {
      setAccount(accounts[0]);
    };
    const onChain = (id: string) => {
      setChainId(Number(id));
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
      setChainId(await wallet.getChainId());
      setTx({
        status: "idle",
      });
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
          id: arcTestnet.id,
        });
      } catch {
        await wallet.addChain({
          chain: arcTestnet,
        });
        await wallet.switchChain({
          id: arcTestnet.id,
        });
      }
      setChainId(await wallet.getChainId());
    } catch (error) {
      setTx({
        status: "error",
        label: "Switching to Arc Testnet",
        message: readableError(error),
      });
    }
  }
  /**
   * Standard transaction wrapper.
   */
  async function send(
    label: string,
    run: (from: Address) => Promise<Hash>,
  ) {
    if (!account) {
      setTx({
        status: "error",
        label,
        message: "Connect a wallet first.",
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
   * TOKENIZE
   *
   * New contract:
   *
   * tokenizeHome(
   *   name,
   *   location,
   *   metadataURI
   * )
   */
  const tokenize = (
    name: string,
    location: string,
    metadataURI = "",
  ) =>
    send(
      `Registering "${name}"`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "tokenizeHome",
            args: [
              name,
              location,
              metadataURI,
            ],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * LIST FOR SALE
   */
  const listForSale = (
    id: bigint,
    price: string,
  ) =>
    send(
      `Listing home #${id} for sale`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "listForSale",
            args: [
              id,
              parseUsdc(price),
            ],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * LIST FOR RENT
   *
   * New contract requires:
   *
   * homeId
   * rentPrice
   * depositAmount
   */
  const listForRent = (
    id: bigint,
    price: string,
    deposit: string,
  ) =>
    send(
      `Listing home #${id} for rent`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "listForRent",
            args: [
              id,
              parseUsdc(price),
              parseUsdc(deposit),
            ],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * DELIST
   */
  const delist = (id: bigint) =>
    send(
      `Delisting home #${id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "delist",
            args: [id],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * BUY
   *
   * New contract requires maxPrice.
   *
   * We use the currently displayed price as the
   * buyer's maximum acceptable price.
   */
  const buy = (home: HomeView) =>
    send(
      `Buying home #${home.id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "buy",
            args: [
              home.id,
              home.salePrice,
            ],
            value: home.salePrice,
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * RENT
   *
   * New contract requires:
   *
   * rent + deposit
   */
  const rent = (home: HomeView) =>
    send(
      `Renting home #${home.id}`,
      async (from) => {
        const total =
          home.rentPrice +
          home.depositAmount;
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "rent",
            args: [home.id],
            value: total,
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * PAY RENT
   *
   * Only the rent amount is paid.
   * The existing security deposit remains held.
   */
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
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * END LEASE
   */
  const endLease = (id: bigint) =>
    send(
      `Ending the lease on home #${id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "endLease",
            args: [id],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * RELEASE DEPOSIT
   */
  const releaseDeposit = (id: bigint) =>
    send(
      `Releasing the deposit for home #${id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "releaseDeposit",
            args: [id],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * WITHDRAW
   *
   * Used for:
   *
   * - sale proceeds
   * - rent proceeds
   * - released deposits
   */
  const withdraw = () =>
    send(
      "Withdrawing available funds",
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "withdraw",
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * Deactivate property.
   */
  const deactivateHome = (id: bigint) =>
    send(
      `Deactivating home #${id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "deactivateHome",
            args: [id],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * Activate property.
   */
  const activateHome = (id: bigint) =>
    send(
      `Activating home #${id}`,
      async (from) => {
        const { request } =
          await publicClient.simulateContract({
            ...homeRegistry,
            functionName: "activateHome",
            args: [id],
            account: from,
          });
        return getWalletClient().writeContract(
          request,
        );
      },
    );
  /**
   * Search/filter.
   */
  const visible = useMemo(() => {
    const query = filter.trim();
    if (!query) {
      return homes;
    }
    if (/^\d+$/.test(query)) {
      return homes.filter(
        (home) =>
          home.id === BigInt(query),
      );
    }
    const needle = query.toLowerCase();
    return homes.filter(
      (home) =>
        home.name
          .toLowerCase()
          .includes(needle) ||
        home.location
          .toLowerCase()
          .includes(needle),
    );
  }, [homes, filter]);
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Home desk</h1>
          <p className="subtitle">
            Find, rent and manage homes on Arc.
          </p>
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
            Set VITE_HOME_REGISTRY_ADDRESS in
            ui/.env to your deployed contract
            address, then restart the dev server.
          </span>
        </div>
      )}
      {!hasWallet() && (
        <div className="banner error">
          <span>
            No injected wallet detected.
            Install MetaMask to send transactions.
          </span>
        </div>
      )}
      {!onArc && account && (
        <div className="banner error">
          <span>
            Your wallet is not connected to Arc
            Testnet.
          </span>
          <button
            type="button"
            onClick={switchToArc}
            disabled={busy}
          >
            Switch to Arc
          </button>
        </div>
      )}
      <TokenizeForm
        disabled={!canWrite || busy}
        onSubmit={tokenize}
      />
      <section className="listing">
        <div className="listing-head">
          <div>
            <h2>Homes</h2>
            <p className="section-subtitle">
              Watch it. Find it. Rent it.
            </p>
          </div>
          <input
            className="filter"
            placeholder="Search homes..."
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          />
        </div>
        {loading && (
          <p className="empty">
            Loading homes from Arc...
          </p>
        )}
        {loadError && (
          <p className="empty">
            Could not read the contract:{" "}
            {loadError}
          </p>
        )}
        {!loading &&
          !loadError &&
          homes.length === 0 && (
            <p className="empty">
              No homes yet. Register the first
              property above.
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
            onReleaseDeposit={releaseDeposit}
            onDeactivate={deactivateHome}
            onActivate={activateHome}
          />
        ))}
      </section>
      {account && canWrite && (
        <section className="wallet-section">
          <div className="wallet-section-head">
            <div>
              <h2>Your funds</h2>
              <p className="section-subtitle">
                Rent and sale proceeds are
                withdrawable from the contract.
              </p>
            </div>
            <button
              type="button"
              className="primary-button"
              onClick={withdraw}
              disabled={busy}
            >
              Withdraw funds
            </button>
          </div>
        </section>
      )}
      <footer>
        <p>
          Property records are not legal title.
          Verification is separate from blockchain
          registration.
        </p>
        <p>
          Contract:{" "}
          {isDeployed
            ? homeRegistryAddress
            : "(not configured)"}
        </p>
        <p>
          Arc Testnet
        </p>
      </footer>
    </div>
  );
}
