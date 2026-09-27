// Generated from the upgraded HomeRegistry contract.
// Frontend ABI for the rental-first Home RWA registry.

export const homeRegistryAbi = [
  {
    type: "function",
    name: "LEASE_TERM",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint64",
        internalType: "uint64",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "homes",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "owner",
        type: "address",
        internalType: "address",
      },
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "location",
        type: "string",
        internalType: "string",
      },
      {
        name: "metadataURI",
        type: "string",
        internalType: "string",
      },
      {
        name: "verified",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "active",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "forSale",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "forRent",
        type: "bool",
        internalType: "bool",
      },
      {
        name: "salePrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rentPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "tenant",
        type: "address",
        internalType: "address",
      },
      {
        name: "leaseEnd",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "depositAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "nextHomeId",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "leases",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "tenant",
        type: "address",
        internalType: "address",
      },
      {
        name: "rent",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "deposit",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "start",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "end",
        type: "uint64",
        internalType: "uint64",
      },
      {
        name: "active",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "deposits",
    inputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "withdrawable",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "leaseActive",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "contractBalance",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "tokenizeHome",
    inputs: [
      {
        name: "name",
        type: "string",
        internalType: "string",
      },
      {
        name: "location",
        type: "string",
        internalType: "string",
      },
      {
        name: "metadataURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "updateMetadata",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "metadataURI",
        type: "string",
        internalType: "string",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "listForSale",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "price",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "listForRent",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "rentPrice",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "depositAmount",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "delist",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "buy",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "maxPrice",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  {
    type: "function",
    name: "rent",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  {
    type: "function",
    name: "payRent",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },

  {
    type: "function",
    name: "endLease",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "releaseDeposit",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "withdraw",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "activateHome",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "deactivateHome",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "verifyProperty",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "removePropertyVerification",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "setPropertyVerifier",
    inputs: [
      {
        name: "verifier",
        type: "address",
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        internalType: "bool",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "pause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },

  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "function",
    name: "propertyVerifiers",
    inputs: [
      {
        name: "",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "bool",
        internalType: "bool",
      },
    ],
    stateMutability: "view",
  },

  {
    type: "event",
    name: "HomeTokenized",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "name",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "location",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "PropertyVerified",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "verifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "PropertyVerificationRemoved",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "verifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "PropertyVerifierUpdated",
    inputs: [
      {
        name: "verifier",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "allowed",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "HomeActivated",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "HomeDeactivated",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "MetadataUpdated",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "metadataURI",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "ListedForSale",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "ListedForRent",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "rentPrice",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "depositAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "Delisted",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "HomePurchased",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "seller",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "buyer",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "price",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "HomeRented",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tenant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "deposit",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "leaseEnd",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "RentPaid",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tenant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "leaseEnd",
        type: "uint64",
        indexed: false,
        internalType: "uint64",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "LeaseEnded",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tenant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "endedBy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "DepositReleased",
    inputs: [
      {
        name: "homeId",
        type: "uint256",
        indexed: true,
        internalType: "uint256",
      },
      {
        name: "tenant",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "event",
    name: "Withdrawal",
    inputs: [
      {
        name: "account",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },

  {
    type: "error",
    name: "EmptyMetadata",
    inputs: [],
  },

  {
    type: "error",
    name: "HomeIsLeased",
    inputs: [],
  },

  {
    type: "error",
    name: "HomeNotActive",
    inputs: [],
  },

  {
    type: "error",
    name: "IncorrectPayment",
    inputs: [
      {
        name: "expected",
        type: "uint256",
        internalType: "uint256",
      },
      {
        name: "sent",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },

  {
    type: "error",
    name: "InvalidAddress",
    inputs: [],
  },

  {
    type: "error",
    name: "InvalidPrice",
    inputs: [],
  },

  {
    type: "error",
    name: "InvalidDeposit",
    inputs: [],
  },

  {
    type: "error",
    name: "LeaseNotExpired",
    inputs: [],
  },

  {
    type: "error",
    name: "NoActiveLease",
    inputs: [],
  },

  {
    type: "error",
    name: "NoDeposit",
    inputs: [],
  },

  {
    type: "error",
    name: "NotForRent",
    inputs: [],
  },

  {
    type: "error",
    name: "NotForSale",
    inputs: [],
  },

  {
    type: "error",
    name: "NotHomeOwner",
    inputs: [],
  },

  {
    type: "error",
    name: "NotTenant",
    inputs: [],
  },

  {
    type: "error",
    name: "PayoutFailed",
    inputs: [],
  },

  {
    type: "error",
    name: "PreviousLeaseNotCleared",
    inputs: [],
  },

  {
    type: "error",
    name: "PropertyNotVerified",
    inputs: [],
  },

  {
    type: "error",
    name: "UnknownHome",
    inputs: [],
  },

  {
    type: "error",
    name: "Unauthorized",
    inputs: [],
  },
] as const;
