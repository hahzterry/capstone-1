import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Address, Hash } from "viem";
import { HomeCard } from "./components/HomeCard";
import { TokenizeForm } from "./components/TokenizeForm";
import {
  TxBanner,
  type TxState,
} from "./components/TxBanner";
import { WalletBar } from "./components/WalletBar";
import {
  arcChain,
  addressUrl,
} from "./lib/chain";
import {
  getCircleAddress,
  getCircleChainId,
  getCircleSdk,
  publicClient,
  setCircleWallet,
  clearCircleWallet,
} from "./lib/clients";
import {
  homeRegistry,
  homeRegistryAddress,
  isDeployed,
} from "./lib/contract";
import type {
  Home,
  HomeView,
} from "./lib/contract";
import {
  readableError,
} from "./lib/errors";
import {
  parseUsdc,
} from "./lib/format";
/**
 * Home RWA
 *
 * Wallet architecture:
 *
 * TikTok
 *   ↓
 * Home RWA
 *   ↓
 * Circle wallet
 *   ↓
 * Arc
 *   ↓
 * USDC
 *
 * This application no longer requires
 * window.ethereum or an injected browser wallet.
 */
export default function App() {
  const [account, setAccount] =
    useState<Address>();
  const [chainId, setChainId] =
    useState<number>();
  const [balance, setBalance] =
    useState<bigint>();
  const [homes, setHomes] =
    useState<HomeView[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [loadError, setLoadError] =
    useState<string>();
  const [filter, setFilter] =
    useState("");
  const [tx, setTx] =
    useState<TxState>({
      status: "idle",
    });
  const busy =
    tx.status === "pending";
  const onArc =
    chainId === arcChain.id;
  const canWrite =
    Boolean(account) &&
    onArc &&
    isDeployed &&
    !busy;
  /**
   * Restore Circle wallet session.
   */
  const restoreCircleWallet =
    useCallback(async () => {
      try {
        const existingAddress =
          getCircleAddress();
        if (existingAddress) {
          setAccount(existingAddress);
          const existingChain =
            getCircleChainId();
          setChainId(
            existingChain ?? arcChain.id,
          );
          return;
        }
        /*
         * Initialize Circle SDK.
         *
         * The SDK itself handles the Circle
         * wallet session.
         */
        await getCircleSdk();
        const restoredAddress =
          getCircleAddress();
        if (restoredAddress) {
          setAccount(restoredAddress);
          setChainId(
            getCircleChainId() ??
              arcChain.id,
          );
        }
      } catch {
        setAccount(undefined);
        setChainId(undefined);
      }
    }, []);
  /**
   * Load every home from HomeRegistry.
   */
  const loadHomes =
    useCallback(async () => {
      if (!isDeployed) {
        setHomes([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(undefined);
      try {
        const count =
          await publicClient.readContract({
            ...homeRegistry,
            functionName: "homeCount",
          });
        const homeCount =
          Number(count);
        if (homeCount === 0) {
          setHomes([]);
          return;
        }
        const ids =
          Array.from(
            {
              length: homeCount,
            },
            (_, index) =>
              BigInt(index + 1),
          );
        const loaded =
          await Promise.all(
            ids.map(
              async (
                id,
              ): Promise<HomeView> => {
                const result =
                  await publicClient.readContract(
                    {
                      ...homeRegistry,
                      functionName:
                        "getHome",
                      args: [id],
                    },
                  );
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
              },
            ),
          );
        setHomes(
          loaded.reverse(),
        );
      } catch (error) {
        setLoadError(
          readableError(error),
        );
      } finally {
        setLoading(false);
      }
    }, []);
  /**
   * Read native USDC balance on Arc.
   */
  const refreshBalance =
    useCallback(async () => {
      if (!account || !onArc) {
        setBalance(undefined);
        return;
      }
      try {
        const nextBalance =
          await publicClient.getBalance({
            address: account,
          });
        setBalance(
          nextBalance,
        );
      } catch {
        setBalance(undefined);
      }
    }, [
      account,
      onArc,
    ]);
  useEffect(() => {
    void restoreCircleWallet();
  }, [
    restoreCircleWallet,
  ]);
  useEffect(() => {
    void loadHomes();
  }, [
    loadHomes,
  ]);
  useEffect(() => {
    void refreshBalance();
  }, [
    refreshBalance,
  ]);
  /**
   * Connect Circle wallet.
   *
   * IMPORTANT:
   *
   * Circle wallet onboarding/authentication
   * must create a challenge on the backend.
   *
   * The Web SDK then executes that challenge.
   */
  async function connect() {
    try {
      setTx({
        status: "pending",
        label: "Connecting wallet",
      });
      const sdk =
        await getCircleSdk();
      /*
       * Circle's browser SDK is initialized here.
       *
       * The actual challenge should be returned
       * by your secure Circle backend.
       *
       * This frontend checks for an already
       * authenticated wallet first.
       */
      const existing =
        getCircleAddress();
      if (existing) {
        setAccount(existing);
        const currentChain =
          getCircleChainId();
        setChainId(
          currentChain ??
            arcChain.id,
        );
        setTx({
          status: "success",
          label: "Wallet connected",
          hash: "0x" as Hash,
        });
        return;
      }
      /*
       * The Circle SDK is intentionally initialized
       * but we do not invent a challenge ID.
       *
       * Your backend endpoint should return the
       * authenticated Circle wallet address after
       * completing the Circle user authentication flow.
       */
      if (
        !sdk ||
        typeof sdk !== "object"
      ) {
        throw new Error(
          "Circle Wallet SDK could not be initialized.",
        );
      }
      throw new Error(
        "Circle wallet authentication is not configured yet. Connect the Circle authentication endpoint.",
      );
    } catch (error) {
      setTx({
        status: "error",
        label: "Connecting wallet",
        message:
          readableError(error),
      });
    }
  }
  /**
   * Switch to Arc.
   *
   * Circle wallets do not use wallet_switchEthereumChain
   * through window.ethereum.
   *
   * Arc is the configured transaction network.
   */
  async function switchToArc() {
    try {
      setTx({
        status: "pending",
        label:
          `Switching to ${arcChain.name}`,
      });
      setCircleWallet(
        account as Address,
        arcChain.id,
      );
      setChainId(
        arcChain.id,
      );
      setTx({
        status: "success",
        label:
          `Connected to ${arcChain.name}`,
        hash: "0x" as Hash,
      });
    } catch (error) {
      setTx({
        status: "error",
        label:
          `Switching to ${arcChain.name}`,
        message:
          readableError(error),
      });
    }
  }
  /**
   * Generic transaction wrapper.
   *
   * NOTE:
   *
   * Circle transactions require a Circle-created
   * challenge and cannot be signed with the old
   * injected-wallet writeContract() flow.
   */
  async function send(
    label: string,
    run: (
      from: Address,
    ) => Promise<Hash>,
  ) {
    if (!account) {
      setTx({
        status: "error",
        label,
        message:
          "Connect your wallet first.",
      });
      return;
    }
    if (!onArc) {
      setTx({
        status: "error",
        label,
        message:
          `Connect your wallet to ${arcChain.name} first.`,
      });
      return;
    }
    if (!isDeployed) {
      setTx({
        status: "error",
        label,
        message:
          "HomeRegistry is not configured.",
      });
      return;
    }
    setTx({
      status: "pending",
      label,
    });
    try {
      const hash =
        await run(account);
      setTx({
        status: "pending",
        label,
        hash,
      });
      const receipt =
        await publicClient.waitForTransactionReceipt(
          {
            hash,
          },
        );
      if (
        receipt.status !==
        "success"
      ) {
        setTx({
          status: "error",
          label,
          message:
            "The transaction reverted on chain.",
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
        message:
          readableError(error),
      });
    }
  }
  /**
   * Register a home.
   *
   * Circle signing will be wired into the
   * transaction challenge endpoint.
   */
  const tokenize = (
    name: string,
    location: string,
    threeWordAddress: string,
    metadataURI: string,
    tiktokURL: string,
  ) =>
    send(
      `Registering "${name}"`,
      async () => {
        /*
         * We intentionally do not call
         * getWalletClient().writeContract()
         * anymore.
         *
         * Circle transaction signing belongs here
         * once the backend returns the transaction
         * challenge.
         */
        throw new Error(
          "Circle transaction signing is not configured yet.",
        );
      },
    );
  const listForSale = (
    id: bigint,
    price: string,
  ) =>
    send(
      `Listing home #${id} for sale`,
      async () => {
        throw new Error(
          "Circle transaction signing is not configured yet.",
        );
      },
    );
  const listForRent = (
    id: bigint,
    price: string,
  ) =>
    send(
      `Listing home #${id} for rent`,
      async () => {
        throw new Error(
          "Circle transaction signing is not configured yet.",
        );
      },
    );
  const delist =
    (id: bigint) =>
      send(
        `Delisting home #${id}`,
        async () => {
          throw new Error(
            "Circle transaction signing is not configured yet.",
          );
        },
      );
  const buy =
    (home: HomeView) =>
      send(
        `Buying home #${home.id}`,
        async () => {
          throw new Error(
            "Circle transaction signing is not configured yet.",
          );
        },
      );
  const rent =
    (home: HomeView) =>
      send(
        `Renting home #${home.id}`,
        async () => {
          throw new Error(
            "Circle transaction signing is not configured yet.",
          );
        },
      );
  const payRent =
    (home: HomeView) =>
      send(
        `Paying rent on home #${home.id}`,
        async () => {
          throw new Error(
            "Circle transaction signing is not configured yet.",
          );
        },
      );
  const endLease =
    (id: bigint) =>
      send(
        `Ending the lease on home #${id}`,
        async () => {
          throw new Error(
            "Circle transaction signing is not configured yet.",
          );
        },
      );
  /**
   * Search homes.
   */
  const visible =
    useMemo(() => {
      const query =
        filter.trim();
      if (!query) {
        return homes;
      }
      if (
        /^\d+$/.test(query)
      ) {
        return homes.filter(
          (home) =>
            home.id ===
            BigInt(query),
        );
      }
      const needle =
        query.toLowerCase();
      return homes.filter(
        (home) =>
          home.name
            .toLowerCase()
            .includes(needle) ||
          home.location
            .toLowerCase()
            .includes(needle) ||
          home.threeWordAddress
            .toLowerCase()
            .includes(needle),
      );
    }, [
      homes,
      filter,
    ]);
  /**
   * Circle Onramp placeholder.
   */
  const addFunds =
    useCallback(() => {
      setTx({
        status: "error",
        label: "Add funds",
        message:
          "Circle Onramp is not configured yet.",
      });
    }, []);
  /**
   * Disconnect local Circle wallet state.
   */
  const disconnect =
    useCallback(() => {
      clearCircleWallet();
      setAccount(undefined);
      setChainId(undefined);
      setBalance(undefined);
      setTx({
        status: "idle",
      });
    }, []);
  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>
            Home RWA
          </h1>
          <p className="subtitle">
            Discover homes through video.
            Rent or buy directly on Arc.
          </p>
        </div>
        <WalletBar
          account={account}
          balance={balance}
          chainId={chainId}
          busy={busy}
          onConnect={connect}
          onSwitchChain={
            switchToArc
          }
          onAddFunds={addFunds}
        />
      </header>
      <TxBanner tx={tx} />
      {!isDeployed && (
        <div className="banner error">
          <span>
            Set
            {" "}
            VITE_HOME_REGISTRY_ADDRESS
            {" "}
            in ui/.env, then redeploy.
          </span>
        </div>
      )}
      {isDeployed && (
        <div className="network-info">
          <span>
            {arcChain.name}
          </span>
          <span className="mono">
            {homeRegistryAddress}
          </span>
        </div>
      )}
      {!account && (
        <div className="banner">
          <span>
            Connect your Home RWA wallet
            to rent or buy a home.
          </span>
          <button
            className="primary"
            type="button"
            onClick={connect}
            disabled={busy}
          >
            Connect wallet
          </button>
        </div>
      )}
      {account &&
        !onArc && (
          <div className="banner error">
            <span>
              Your wallet is not connected
              to {arcChain.name}.
            </span>
            <button
              className="primary"
              type="button"
              onClick={
                switchToArc
              }
              disabled={busy}
            >
              Switch to{" "}
              {arcChain.name}
            </button>
          </div>
        )}
      {account && (
        <div className="wallet-session">
          <span>
            Wallet connected
          </span>
          <span className="mono">
            {account}
          </span>
          <button
            className="secondary"
            type="button"
            onClick={disconnect}
            disabled={busy}
          >
            Disconnect
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
            <h2>
              Homes
            </h2>
            <p className="hint">
              Browse homes by location,
              3 Word Address, or home ID.
            </p>
          </div>
          <input
            className="filter"
            placeholder="Search homes, locations or 3 Word Address"
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value,
              )
            }
          />
        </div>
        {loading && (
          <p className="empty">
            Loading homes from{" "}
            {arcChain.name}...
          </p>
        )}
        {loadError && (
          <p className="empty">
            Could not read HomeRegistry:{" "}
            {loadError}
          </p>
        )}
        {!loading &&
          !loadError &&
          homes.length === 0 && (
            <p className="empty">
              No homes yet.
              Register the first one above.
            </p>
          )}
        {!loading &&
          homes.length > 0 &&
          visible.length === 0 && (
            <p className="empty">
              Nothing matches "
              {filter}
              ".
            </p>
          )}
        {visible.map(
          (home) => (
            <HomeCard
              key={home.id.toString()}
              home={home}
              account={account}
              busy={
                busy ||
                !canWrite
              }
              onListForSale={
                listForSale
              }
              onListForRent={
                listForRent
              }
              onDelist={
                delist
              }
              onBuy={
                buy
              }
              onRent={
                rent
              }
              onPayRent={
                payRent
              }
              onEndLease={
                endLease
              }
            />
          ),
        )}
      </section>
      <footer>
        <p>
          Home RWA records are not legal
          title to real property. Always
          verify property information
          independently.
        </p>
        {isDeployed && (
          <p>
            HomeRegistry:{" "}
            <a
              href={addressUrl(
                homeRegistryAddress,
              )}
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
