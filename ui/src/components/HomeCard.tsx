import { useState } from "react";
import { zeroAddress, type Address } from "viem";
import type { HomeView } from "../lib/contract";
import { addressUrl } from "../lib/chain";
import {
  daysLeft,
  formatLeaseEnd,
  formatUsdc,
  isLeaseActive,
  isValidAmount,
  shortAddress,
} from "../lib/format";

type Props = {
  home: HomeView;
  account?: Address;
  busy: boolean;
  onListForSale: (id: bigint, price: string) => void;
  onListForRent: (id: bigint, price: string) => void;
  onDelist: (id: bigint) => void;
  onBuy: (home: HomeView) => void;
  onRent: (home: HomeView) => void;
  onPayRent: (home: HomeView) => void;
  onEndLease: (id: bigint) => void;
};

const sameAddress = (a?: string, b?: string) =>
  Boolean(a && b && a.toLowerCase() === b.toLowerCase());

export function HomeCard({
  home,
  account,
  busy,
  onListForSale,
  onListForRent,
  onDelist,
  onBuy,
  onRent,
  onPayRent,
  onEndLease,
}: Props) {
  const [salePrice, setSalePrice] = useState("");
  const [rentPrice, setRentPrice] = useState("");

  const leased = isLeaseActive(home.leaseEnd);
  const isLandlord = sameAddress(account, home.owner);
  const isTenant = sameAddress(account, home.tenant);
  const hasTenant = home.tenant !== zeroAddress;
  const connected = Boolean(account);

  return (
    <article className="card home">
      <header>
        <div>
          <h3>
            <span className="id">#{home.id.toString()}</span> {home.name}
          </h3>
          <p className="location">{home.location}</p>
        </div>
        <div className="tags">
          {leased && <span className="tag leased">Leased</span>}
          {home.forSale && <span className="tag sale">For sale</span>}
          {home.forRent && <span className="tag rent">For rent</span>}
          {!leased && !home.forSale && !home.forRent && <span className="tag idle">Not listed</span>}
          {isLandlord && <span className="tag you">You are the landlord</span>}
          {isTenant && <span className="tag you">You are the tenant</span>}
        </div>
      </header>

      <dl className="facts">
        <div>
          <dt>Landlord</dt>
          <dd>
            <a className="mono" href={addressUrl(home.owner)} target="_blank" rel="noreferrer">
              {shortAddress(home.owner)}
            </a>
          </dd>
        </div>
        <div>
          <dt>Sale price</dt>
          <dd>{home.forSale ? `${formatUsdc(home.salePrice)} USDC` : "-"}</dd>
        </div>
        <div>
          <dt>Rent / 30 days</dt>
          <dd>{home.forRent ? `${formatUsdc(home.rentPrice)} USDC` : "-"}</dd>
        </div>
        <div>
          <dt>Tenant</dt>
          <dd>
            {hasTenant ? (
              <a className="mono" href={addressUrl(home.tenant)} target="_blank" rel="noreferrer">
                {shortAddress(home.tenant)}
              </a>
            ) : (
              "-"
            )}
          </dd>
        </div>
        <div>
          <dt>Lease ends</dt>
          <dd>
            {formatLeaseEnd(home.leaseEnd)}
            {leased && <span className="muted"> ({daysLeft(home.leaseEnd)} days left)</span>}
          </dd>
        </div>
      </dl>

      <div className="actions">
        <button
          disabled={busy || !connected || !home.forSale || leased || isLandlord}
          onClick={() => onBuy(home)}
        >
          {home.forSale ? `Buy for ${formatUsdc(home.salePrice)} USDC` : "Buy"}
        </button>
        <button
          disabled={busy || !connected || !home.forRent || leased || isLandlord}
          onClick={() => onRent(home)}
        >
          {home.forRent ? `Rent for ${formatUsdc(home.rentPrice)} USDC` : "Rent"}
        </button>
        {isTenant && (
          <>
            <button
              disabled={busy || home.rentPrice === 0n}
              onClick={() => onPayRent(home)}
            >
              Pay rent (+30 days)
            </button>
            <button disabled={busy} onClick={() => onEndLease(home.id)}>
              End my lease
            </button>
          </>
        )}
      </div>

      {isLandlord && (
        <div className="landlord">
          {leased && (
            <p className="hint">
              Listings are frozen while a lease is running. You can end it once it expires.
            </p>
          )}
          <div className="row">
            <input
              placeholder="Sale price in USDC"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
              disabled={leased}
            />
            <button
              disabled={busy || leased || !isValidAmount(salePrice)}
              onClick={() => {
                onListForSale(home.id, salePrice);
                setSalePrice("");
              }}
            >
              List for sale
            </button>
          </div>
          <div className="row">
            <input
              placeholder="Rent per 30 days in USDC"
              value={rentPrice}
              onChange={(event) => setRentPrice(event.target.value)}
              disabled={leased}
            />
            <button
              disabled={busy || leased || !isValidAmount(rentPrice)}
              onClick={() => {
                onListForRent(home.id, rentPrice);
                setRentPrice("");
              }}
            >
              List for rent
            </button>
          </div>
          <div className="row">
            <button
              disabled={busy || leased || (!home.forSale && !home.forRent)}
              onClick={() => onDelist(home.id)}
            >
              Delist
            </button>
            <button
              disabled={busy || !hasTenant || leased}
              onClick={() => onEndLease(home.id)}
            >
              End expired lease
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
