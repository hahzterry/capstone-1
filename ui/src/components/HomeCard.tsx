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
  onListForRent: (
    id: bigint,
    price: string,
    deposit: string,
  ) => void;

  onDelist: (id: bigint) => void;
  onBuy: (home: HomeView) => void;
  onRent: (home: HomeView) => void;
  onPayRent: (home: HomeView) => void;
  onEndLease: (id: bigint) => void;

  onReleaseDeposit: (id: bigint) => void;
  onActivate: (id: bigint) => void;
  onDeactivate: (id: bigint) => void;
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
  onReleaseDeposit,
  onActivate,
  onDeactivate,
}: Props) {
  const [salePrice, setSalePrice] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const leased = isLeaseActive(home.leaseEnd);

  const isLandlord = sameAddress(account, home.owner);
  const isTenant = sameAddress(account, home.tenant);

  const hasTenant = home.tenant !== zeroAddress;
  const hasDeposit = home.depositAmount > 0n;
  const connected = Boolean(account);

  const isInactive = !home.active;

  const canList =
    isLandlord &&
    connected &&
    home.active &&
    !leased &&
    !hasTenant &&
    !hasDeposit;

  const canDelist =
    isLandlord &&
    connected &&
    home.active &&
    !leased &&
    !hasTenant;

  return (
    <article className={`card home${isInactive ? " inactive" : ""}`}>
      <header>
        <div>
          <h3>
            <span className="id">#{home.id.toString()}</span>{" "}
            {home.name}
          </h3>

          <p className="location">{home.location}</p>
        </div>

        <div className="tags">
          {!home.active && (
            <span className="tag idle">Inactive</span>
          )}

          {home.active && (
            <span className="tag active">Active</span>
          )}

          {home.verified && (
            <span className="tag verified">Verified</span>
          )}

          {leased && (
            <span className="tag leased">Leased</span>
          )}

          {home.forSale && (
            <span className="tag sale">For sale</span>
          )}

          {home.forRent && (
            <span className="tag rent">For rent</span>
          )}

          {home.active &&
            !leased &&
            !home.forSale &&
            !home.forRent && (
              <span className="tag idle">Not listed</span>
            )}

          {isLandlord && (
            <span className="tag you">
              You are the landlord
            </span>
          )}

          {isTenant && (
            <span className="tag you">
              You are the tenant
            </span>
          )}
        </div>
      </header>

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
              : "-"}
          </dd>
        </div>

        <div>
          <dt>Rent / 30 days</dt>
          <dd>
            {home.forRent
              ? `${formatUsdc(home.rentPrice)} USDC`
              : "-"}
          </dd>
        </div>

        <div>
          <dt>Security deposit</dt>
          <dd>
            {home.forRent
              ? `${formatUsdc(home.depositAmount)} USDC`
              : "-"}
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
              "-"
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

        {hasDeposit && (
          <div>
            <dt>Held deposit</dt>
            <dd>
              {formatUsdc(home.depositAmount)} USDC
            </dd>
          </div>
        )}
      </dl>

      {home.metadataURI && (
        <div className="metadata">
          <a
            href={home.metadataURI}
            target="_blank"
            rel="noreferrer"
          >
            View property details
          </a>
        </div>
      )}

      {!home.active && (
        <div className="notice">
          This property is currently inactive and cannot be
          rented or purchased.
        </div>
      )}

      {home.active && !home.verified && (
        <div className="notice">
          This property has not been verified.
        </div>
      )}

      <div className="actions">
        <button
          disabled={
            busy ||
            !connected ||
            !home.active ||
            !home.forSale ||
            leased ||
            hasTenant ||
            isLandlord
          }
          onClick={() => onBuy(home)}
        >
          {home.forSale
            ? `Buy for ${formatUsdc(home.salePrice)} USDC`
            : "Buy"}
        </button>

        <button
          disabled={
            busy ||
            !connected ||
            !home.active ||
            !home.forRent ||
            leased ||
            hasTenant ||
            isLandlord
          }
          onClick={() => onRent(home)}
        >
          {home.forRent
            ? `Rent for ${formatUsdc(home.rentPrice)} USDC`
            : "Rent"}
        </button>

        {isTenant && leased && (
          <>
            <button
              disabled={
                busy ||
                !home.active ||
                home.rentPrice === 0n
              }
              onClick={() => onPayRent(home)}
            >
              Pay rent +30 days
            </button>

            <button
              disabled={busy}
              onClick={() => onEndLease(home.id)}
            >
              End my lease
            </button>
          </>
        )}

        {isTenant && !leased && hasDeposit && (
          <button
            disabled={busy}
            onClick={() => onReleaseDeposit(home.id)}
          >
            Release deposit
          </button>
        )}
      </div>

      {isLandlord && (
        <div className="landlord">
          {leased && (
            <p className="hint">
              Listings are frozen while a lease is active.
            </p>
          )}

          {!leased && hasTenant && (
            <p className="hint">
              This property has an expired lease. End the
              expired lease before listing it again.
            </p>
          )}

          {hasDeposit && !leased && (
            <p className="hint">
              A security deposit is still held for this
              property and must be released before creating
              another lease.
            </p>
          )}

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
                onListForSale(home.id, salePrice);
                setSalePrice("");
              }}
            >
              List for sale
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

            <input
              placeholder="Security deposit in USDC"
              value={depositAmount}
              onChange={(event) =>
                setDepositAmount(event.target.value)
              }
              disabled={!canList || busy}
            />

            <button
              disabled={
                busy ||
                !canList ||
                !isValidAmount(rentPrice) ||
                !isValidAmount(depositAmount)
              }
              onClick={() => {
                onListForRent(
                  home.id,
                  rentPrice,
                  depositAmount,
                );

                setRentPrice("");
                setDepositAmount("");
              }}
            >
              List for rent
            </button>
          </div>

          <div className="row">
            <button
              disabled={
                busy ||
                !canDelist ||
                (!home.forSale && !home.forRent)
              }
              onClick={() => onDelist(home.id)}
            >
              Delist
            </button>

            <button
              disabled={
                busy ||
                !hasTenant ||
                leased
              }
              onClick={() => onEndLease(home.id)}
            >
              End expired lease
            </button>

            {hasDeposit && !leased && (
              <button
                disabled={busy}
                onClick={() =>
                  onReleaseDeposit(home.id)
                }
              >
                Release deposit
              </button>
            )}
          </div>

          <div className="row">
            {home.active ? (
              <button
                disabled={
                  busy ||
                  leased ||
                  hasTenant ||
                  hasDeposit
                }
                onClick={() =>
                  onDeactivate(home.id)
                }
              >
                Deactivate property
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() =>
                  onActivate(home.id)
                }
              >
                Activate property
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
