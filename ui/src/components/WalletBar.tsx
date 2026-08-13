import type { Address } from "viem";
import { arcTestnet, addressUrl } from "../lib/chain";
import { formatUsdc, shortAddress } from "../lib/format";

type Props = {
  account?: Address;
  balance?: bigint;
  chainId?: number;
  busy: boolean;
  onConnect: () => void;
  onSwitchChain: () => void;
};

export function WalletBar({ account, balance, chainId, busy, onConnect, onSwitchChain }: Props) {
  if (!account) {
    return (
      <div className="wallet">
        <button className="primary" onClick={onConnect} disabled={busy}>
          Connect wallet
        </button>
      </div>
    );
  }

  if (chainId !== arcTestnet.id) {
    return (
      <div className="wallet">
        <span className="warning">Wrong network</span>
        <button className="primary" onClick={onSwitchChain} disabled={busy}>
          Switch to Arc Testnet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet">
      <a className="mono" href={addressUrl(account)} target="_blank" rel="noreferrer">
        {shortAddress(account)}
      </a>
      <span className="balance">
        {balance === undefined ? "..." : `${formatUsdc(balance, 4)} USDC`}
      </span>
    </div>
  );
}
