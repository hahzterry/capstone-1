import type { Hash } from "viem";
import { txUrl } from "../lib/chain";

export type TxState =
  | { status: "idle" }
  | {
      status: "pending";
      label: string;
      hash?: Hash;
    }
  | {
      status: "success";
      label: string;
      hash: Hash;
    }
  | {
      status: "error";
      label: string;
      message: string;
      hash?: Hash;
    };

export function TxBanner({ tx }: { tx: TxState }) {
  if (tx.status === "idle") {
    return null;
  }

  const explorerLabel =
    tx.status === "pending"
      ? "View transaction"
      : "View on Arc Explorer";

  return (
    <div
      className={`banner ${tx.status}`}
      role={tx.status === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <span>
        {tx.status === "pending" &&
          `${tx.label}...`}

        {tx.status === "success" &&
          `${tx.label} complete.`}

        {tx.status === "error" &&
          `${tx.label} failed. ${tx.message}`}
      </span>

      {"hash" in tx && tx.hash && (
        <a
          href={txUrl(tx.hash)}
          target="_blank"
          rel="noreferrer"
        >
          {explorerLabel}
        </a>
      )}
    </div>
  );
}
