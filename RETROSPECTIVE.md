# Retrospective — what stands between this and mainnet

The demo does what it claims on Arc Testnet: a landlord tokenizes a home, lists it,
and a tenant or buyer settles in native USDC. Everything below is a reason not to put
it in front of real money or a real tenant.

## The registry is not the property

Nothing connects `homeId` to a deed. Two people can tokenize the same flat, and the
contract will happily rent both. On mainnet this needs an off-chain attestation — a
notary, a registrar, or at minimum a signed statement from a party willing to be sued —
and the contract has to refuse to mint without one. That also means identity: today
`msg.sender` is the only thing the contract knows about a landlord.

## Circle can freeze USDC

Payouts are pushed with a raw `call` at the end of `buy`, `rent` and `payRent`. On Arc
mainnet, USDC is the native token and Circle can blacklist an address. If a seller or
landlord is frozen, the transfer fails, the whole transaction reverts, and the buyer or
tenant simply cannot transact with that home — a permanent, unfixable revert for an
immutable contract. A production version should hold the funds and let the recipient
withdraw, so a frozen counterparty blocks only their own withdrawal.

The same applies to any owner that is a contract without a payable fallback. It can
own a home here and can never be paid.

## The contract is frozen the day it ships

No proxy, no pause, no admin. That is a deliberate v1 choice and it is also the biggest
risk: an economic bug is permanent, and there is nobody who can stop it. It has not been
audited, only unit tested against the cases the spec anticipated.

## Money handling gaps

- No deposit, no escrow, no arrears. A tenant who stops paying just lets the lease lapse;
  the landlord's only remedy is `endLease` after expiry.
- Rent is forwarded to whoever is `owner` at the moment of the call. Since a home cannot
  be sold while leased, that is safe today, but the invariant is implicit rather than
  enforced by a test on the sale path.
- Exact payment means a landlord can re-list at a higher price in the same block a buyer
  submits `buy`, and the buyer's transaction reverts. There is no theft — the value is
  returned with the revert — but it is a cheap way to grief buyers. Mainnet wants a
  buyer-supplied `maxPrice`, or a listing nonce.

## Product gaps

- One lease at a time, one fixed 30-day term, no notice period, no renewal negotiation.
- Metadata is two free-form strings. No documents, no photos, no IPFS URI.
- A home can never be removed, so a mistaken or malicious tokenization sits in the list
  forever.
- The UI reads every home one call at a time. That is fine at demo scale and falls over
  well before a real listing book.

## What I would fix first

Pull payments over push. It is the one change that turns an unfixable revert into an
inconvenience, and on a chain where the native token can be frozen by its issuer, that
distinction is the difference between a working market and a dead one.
