# Home RWA — Spec

An on-chain property desk on Arc Testnet. A landlord registers a home, lists it for
sale or for rent, and buyers/tenants settle in native USDC.

This is v1. One home model, one lease at a time, no legal or KYC layer.

## Not a legal title

The records in this contract are **not** proof of property ownership. `name` and
`location` are free-form strings supplied by whoever calls `tokenizeHome`, and the
contract has no way to check them against a land registry, a survey, or any other
off-chain source. Owning a `homeId` means you own a row in this contract and nothing
more. Anyone can tokenize the same address twice, or an address they have never seen.

## Roles

| Role | Who | Can do |
|---|---|---|
| Landlord | `home.owner` | tokenize, list for sale, list for rent, delist, end an expired lease |
| Buyer | anyone | `buy` a home that is listed for sale |
| Tenant | `home.tenant` | `rent` a listed home, `payRent` to extend, end their own lease early |

Roles are positional, not granted. Whoever holds `home.owner` is the landlord; the
buyer becomes the landlord the moment `buy` succeeds.

## Home

| Field | Type | Notes |
|---|---|---|
| `owner` | `address` | current landlord |
| `name` | `string` | required, non-empty |
| `location` | `string` | required, non-empty |
| `forSale` | `bool` | sale listing flag |
| `salePrice` | `uint256` | wei-denominated native USDC (18 decimals on Arc) |
| `forRent` | `bool` | rent listing flag |
| `rentPrice` | `uint256` | price of one 30-day term |
| `tenant` | `address` | zero if never rented |
| `leaseEnd` | `uint64` | unix seconds; lease is active while `leaseEnd > block.timestamp` |

Home ids start at 1. Id 0 is never assigned, so a zero id always means "no home".

## Listing modes

A home can carry both flags at once — listed for sale and for rent — until someone
acts. The first action wins:

- `buy` clears both listings and moves `owner`.
- `rent` clears the sale listing, keeps the rent listing for the next term, and starts
  a lease.

A home with an active lease cannot be listed for sale or bought. That is the core
protection for the tenant: a landlord cannot sell out from under a running lease.

For the same reason, the landlord cannot re-list for rent or delist while a lease is
running. Both would move `rentPrice` under a sitting tenant, who has to send exactly
that amount to renew.

## State flow

```
tokenize
   |
   +--> listForSale ---> buy ---> owner changes, both listings cleared
   |                       ^
   |                       |  (blocked while a lease is active)
   |
   +--> listForRent ---> rent ---> leased
                            |         |
                            |         +--> payRent  (extends by one term)
                            |         +--> endLease (tenant any time, landlord after expiry)
                            |
                            +--> delist (landlord, only when no lease is active)
```

`payRent` extends from `leaseEnd` when the lease is still running, and from
`block.timestamp` when it has already lapsed. A tenant who pays late gets a full term
from the day they pay, not a term backdated into the past.

## endLease rules

- **Tenant** may end at any time. They forfeit whatever prepaid time is left; the
  contract holds no rent to refund, since every payment is forwarded to the landlord
  immediately.
- **Landlord** may end only once `leaseEnd` has passed. While the lease runs, the
  landlord has no lever to evict.

Either way the tenant slot is cleared and `leaseEnd` is zeroed. The rent listing, if
the landlord left one up, stays up for the next tenant.

## Payments

Arc uses USDC as its native gas token, so rent and sale prices ride on `msg.value`
and no ERC-20 approval step is needed. Native balances on Arc are 18-decimal, the same
shape as wei, not the 6 decimals of ERC-20 USDC.

Payments are exact — `buy` and `rent` revert on any `msg.value` other than the listed
price rather than refunding change. The contract never holds a balance between calls:
every payment is forwarded to the seller or the landlord inside the same transaction,
after state has been written.

## Design choices

**No ERC-721.** "Tokenize" here means a registry entry with an owner, not a
transferable NFT. Keeping ownership inside the contract means the only ways to change
`owner` are `tokenizeHome` and `buy`, so the lease guard cannot be side-stepped by
transferring a token out of band. A future version that wants transferable or
fractional ownership would need to re-apply the lease check on every transfer path.

**Pay-forward, not pull.** Sale proceeds and rent are pushed to the recipient with a
low-level `call` at the end of the function. This keeps the contract balance at zero
and avoids a withdrawal step in the UI, at the cost of reverting if the recipient is a
contract that rejects value.

## Out of scope for v1

- Legal title, KYC/AML, identity of any kind
- Deposits, escrow, late fees, partial payments, rent arrears
- More than one tenant, sublets, or overlapping leases
- Rent denominated in anything other than native USDC
- Off-chain metadata (IPFS), images, documents
- Upgradeability, pausing, admin roles, protocol fees
- Dispute resolution — if a landlord takes rent for a home that does not exist, the
  contract offers the tenant no recourse
