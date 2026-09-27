import { useState } from "react";
import type { Address } from "viem";
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
function getPropertyUrl(homeId: bigint) {
  if (typeof window === "undefined") {
    return `/home/${homeId.toString()}`;
  }
  return `${window.location.origin}/home/${homeId.toString()}`;
}
function isTikTokUrl(url: string) {
  return /^https:\/\/(www\.)?tiktok\.com\/.+/i.test(url);
}
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
  const [copied, setCopied] = useState(false);
  const leased = isLeaseActive(home.leaseEnd);
  const isLandlord = sameAddress(account, home.owner);
  const isTenant = sameAddress(account, home.tenant);
  const hasTenant =
    home.tenant !== "0x0000000000000000000000000000000000000000";
  const connected = Boolean(account);
  const canList =
    isLandlord &&
    connected &&
    !leased &&
    !hasTenant;
  const canDelist =
    isLandlord &&
    connected &&
    !leased &&
    !hasTenant;
  const propertyUrl = getPropertyUrl(home.id);
  async function copyPropertyLink() {
    try {
      await navigator.clipboard.writeText(propertyUrl);
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
    }
  }
  return (
    <article className="card home">
      <header>
        <div>
          <h3>
            <span className="id">#{home.id.toString()}</span>{" "}
            {home.name}
          </h3>
          <p className="location">📍 {home.location}</p>
        </div>
        <div className="tags">
          {home.forRent && (
            <span className="tag rent">🏠 For rent</span>
          )}
          {home.forSale && (
            <span className="tag sale">🏷️ For sale</span>
          )}
          {leased && (
            <span className="tag leased">🔒 Leased</span>
          )}
          {!leased &&
            !home.forSale &&
            !home.forRent && (
              <span className="tag idle">
                Not listed
              </span>
            )}
          {isLandlord && (
            <span className="tag you">
              👤 You are the landlord
            </span>
          )}
          {isTenant && (
            <span className="tag you">
              🏡 You are the tenant
            </span>
          )}
        </div>
      </header>
      {home.tiktokURL && isTikTokUrl(home.tiktokURL) && (
        <div className="property-video">
          <a
            className="tiktok-link"
            href={home.tiktokURL}
            target="_blank"
            rel="noreferrer"
          >
            <span className="tiktok-icon">▶</span>
            <span>
              <strong>Watch the property on TikTok</strong>
              <small>
                See the home before you rent or buy
              </small>
            </span>
            <span>↗</span>
          </a>
        </div>
      )}
      <div className="property-identity">
        <div>
          <span className="identity-label">
            📍 3 Word Address
          </span>
          <strong className="three-word-address">
            {home.threeWordAddress || "Not provided"}
          </strong>
        </div>
        <button
          type="button"
          className="secondary"
          onClick={copyPropertyLink}
          disabled={busy}
        >
          {copied ? "✓ Copied" : "🔗 Share"}
        </button>
      </div>
      <dl className="facts">
        <div>
          <dt>Landlord</dt>
          <dd>
            <a
              className="mono"
              href={addressUrl(home.owner)}
              target="_blank"
              rel="noreferrer"
            >
              {shortAddress(home.owner)}
            </a>
          </dd>
        </div>
        <div>
          <dt>Sale price</dt>
          <dd>
            {home.forSale
              ? `${formatUsdc(home.salePrice)} USDC`
              : "Not listed"}
          </dd>
        </div>
        <div>
          <dt>Rent / 30 days</dt>
          <dd>
            {home.forRent
              ? `${formatUsdc(home.rentPrice)} USDC`
              : "Not listed"}
          </dd>
        </div>
        <div>
          <dt>Tenant</dt>
          <dd>
            {hasTenant ? (
              <a
                className="mono"
                href={addressUrl(home.tenant)}
                target="_blank"
                rel="noreferrer"
              >
                {shortAddress(home.tenant)}
              </a>
            ) : (
              "Available"
            )}
          </dd>
        </div>
        <div>
          <dt>Lease ends</dt>
          <dd>
            {formatLeaseEnd(home.leaseEnd)}
            {leased && (
              <span className="muted">
                {" "}
                ({daysLeft(home.leaseEnd)} days left)
              </span>
            )}
          </dd>
        </div>
      </dl>
      {home.metadataURI && (
        <div className="metadata">
          <a
            href={home.metadataURI}
            target="_blank"
            rel="noreferrer"
          >
            📄 View property details
          </a>
        </div>
      )}
      {leased && (
        <div className="notice">
          🔒 This home currently has an active lease.
          Purchasing and creating a new lease are disabled
          until the current lease ends.
        </div>
      )}
      <div className="actions">
        <button
          className="primary"
          disabled={
            busy ||
            !connected ||
            !home.forRent ||
            leased ||
            hasTenant ||
            isLandlord
          }
          onClick={() => onRent(home)}
        >
          {home.forRent
            ? `🏠 Rent for ${formatUsdc(home.rentPrice)} USDC`
            : "🏠 Not available for rent"}
        </button>
        <button
          disabled={
            busy ||
            !connected ||
            !home.forSale ||
            leased ||
            hasTenant ||
            isLandlord
          }
          onClick={() => onBuy(home)}
        >
          {home.forSale
            ? `🏷️ Buy for ${formatUsdc(home.salePrice)} USDC`
            : "🏷️ Not for sale"}
        </button>
      </div>
      {isTenant && leased && (
        <div className="tenant">
          <div className="row">
            <button
              disabled={
                busy ||
                home.rentPrice === 0n
              }
              onClick={() => onPayRent(home)}
            >
              💳 Pay rent +30 days
            </button>
            <button
              disabled={busy}
              onClick={() => onEndLease(home.id)}
            >
              End my lease
            </button>
          </div>
        </div>
      )}
      {isLandlord && (
        <div className="landlord">
          {leased && (
            <p className="hint">
              🔒 Listings are frozen while a lease is active.
            </p>
          )}
          {!leased && hasTenant && (
            <p className="hint">
              This home has an expired lease. End the
              expired lease before listing it again.
            </p>
          )}
          {!leased && !hasTenant && (
            <>
              <div className="row">
                <input
                  placeholder="Sale price in USDC"
                  value={salePrice}
                  onChange={(event) =>
                    setSalePrice(event.target.value)
                  }
                  disabled={!canList || busy}
                />
                <button
                  disabled={
                    busy ||
                    !canList ||
                    !isValidAmount(salePrice)
                  }
                  onClick={() => {
                    onListForSale(
                      home.id,
                      salePrice,
                    );
                    setSalePrice("");
                  }}
                >
                  🏷️ List for sale
                </button>
              </div>
              <div className="row">
                <input
                  placeholder="Rent / 30 days in USDC"
                  value={rentPrice}
                  onChange={(event) =>
                    setRentPrice(event.target.value)
                  }
                  disabled={!canList || busy}
                />
                <button
                  disabled={
                    busy ||
                    !canList ||
                    !isValidAmount(rentPrice)
                  }
                  onClick={() => {
                    onListForRent(
                      home.id,
                      rentPrice,
                    );
                    setRentPrice("");
                  }}
                >
                  🏠 List for rent
                </button>
              </div>
              <div className="row">
                <button
                  disabled={
                    busy ||
                    !canDelist ||
                    (!home.forSale &&
                      !home.forRent)
                  }
                  onClick={() =>
                    onDelist(home.id)
                  }
                >
                  Remove listings
                </button>
              </div>
            </>
          )}
          {hasTenant && !leased && (
            <div className="row">
              <button
                disabled={busy}
                onClick={() =>
                  onEndLease(home.id)
                }
              >
                End expired lease
              </button>
            </div>
          )}
        </div>
      )}
      <footer className="home-card-footer">
        <span>
          Home #{home.id.toString()} · On-chain property record
        </span>
        <a
          href={propertyUrl}
          target="_blank"
          rel="noreferrer"
        >
          Open property ↗
        </a>
      </footer>
    </article>
  );
}
