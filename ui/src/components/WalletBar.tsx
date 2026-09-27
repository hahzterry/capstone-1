import type { Address } from "viem";
import { arcChain, addressUrl } from "../lib/chain";
import { formatUsdc, shortAddress } from "../lib/format";

type Props = {
  account?: Address;
  balance?: bigint;
  chainId?: number;
  busy: boolean;
  onConnect: () => void;
  onSwitchChain: () => void;
  onAddFunds: () => void;
};

export function WalletBar({
  account,
  balance,
  chainId,
  busy,
  onConnect,
  onSwitchChain,
  onAddFunds,
}: Props) {
  if (!account) {
    return (
      <div className="wallet">
        <button className="primary" onClick={onConnect} disabled={busy}>
          Connect wallet
        </button>
      </div>
    );
  }

  if (chainId !== arcChain.id) {
    return (
      <div className="wallet">
        <span className="warning">Wrong network</span>

        <button
          className="primary"
          onClick={onSwitchChain}
          disabled={busy}
        >
          Switch to {arcChain.name}
        </button>
      </div>
    );
  }

  return (
    <div className="wallet">
      <a
        className="mono"
        href={addressUrl(account)}
        target="_blank"
        rel="noreferrer"
      >
        {shortAddress(account)}
      </a>

      <span className="balance">
        {balance === undefined
          ? "..."
          : `${formatUsdc(balance, 4)} USDC`}
      </span>

      <button
        className="secondary"
        onClick={onAddFunds}
        disabled={busy}
      >
        Add funds
      </button>
    </div>
  );
}
