import type { Hash } from "viem";
import { txUrl } from "../lib/chain";

export type TxState =
  | { status: "idle" }
  | { status: "pending"; label: string; hash?: Hash }
  | { status: "success"; label: string; hash: Hash }
  | { status: "error"; label: string; message: string };

export function TxBanner({ tx }: { tx: TxState }) {
  if (tx.status === "idle") return null;

  return (
    <div className={`banner ${tx.status}`}>
      <span>
        {tx.status === "pending" && `${tx.label}...`}
        {tx.status === "success" && `${tx.label} - done.`}
        {tx.status === "error" && `${tx.label} failed. ${tx.message}`}
      </span>
      {"hash" in tx && tx.hash && (
        <a href={txUrl(tx.hash)} target="_blank" rel="noreferrer">
          View on Arcscan
        </a>
      )}
    </div>
  );
}
