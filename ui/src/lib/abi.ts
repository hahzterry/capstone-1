import type { Abi } from "viem";
export const homeRegistryAbi = [
  {
    type: "function",
    name: "LEASE_TERM",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint64" }],
  },
  {
    type: "function",
    name: "homeCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getHome",
    stateMutability: "view",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "leaseEnd", type: "uint64" },
      { name: "forSale", type: "bool" },
      { name: "forRent", type: "bool" },
      { name: "tenant", type: "address" },
      { name: "salePrice", type: "uint256" },
      { name: "rentPrice", type: "uint256" },
      { name: "name", type: "string" },
      { name: "location", type: "string" },
      { name: "threeWordAddress", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "tiktokURL", type: "string" },
    ],
  },
  {
    type: "function",
    name: "isLeaseActive",
    stateMutability: "view",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "tokenizeHome",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "location", type: "string" },
      { name: "threeWordAddress", type: "string" },
      { name: "metadataURI", type: "string" },
      { name: "tiktokURL", type: "string" },
    ],
    outputs: [{ name: "homeId", type: "uint256" }],
  },
  {
    type: "function",
    name: "updateMetadata",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeId", type: "uint256" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateThreeWordAddress",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeId", type: "uint256" },
      { name: "threeWordAddress", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "updateTikTokURL",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeId", type: "uint256" },
      { name: "tiktokURL", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listForSale",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeId", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "listForRent",
    stateMutability: "nonpayable",
    inputs: [
      { name: "homeId", type: "uint256" },
      { name: "rentPrice", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "delist",
    stateMutability: "nonpayable",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "buy",
    stateMutability: "payable",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "rent",
    stateMutability: "payable",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "payRent",
    stateMutability: "payable",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "endLease",
    stateMutability: "nonpayable",
    inputs: [{ name: "homeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "event",
    name: "HomeTokenized",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: false,
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        name: "location",
        type: "string",
      },
    ],
  },
  {
    type: "event",
    name: "MetadataUpdated",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: false,
        name: "metadataURI",
        type: "string",
      },
    ],
  },
  {
    type: "event",
    name: "ThreeWordAddressUpdated",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: false,
        name: "threeWordAddress",
        type: "string",
      },
    ],
  },
  {
    type: "event",
    name: "TikTokURLUpdated",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: false,
        name: "tiktokURL",
        type: "string",
      },
    ],
  },
  {
    type: "event",
    name: "ListedForSale",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: false,
        name: "price",
        type: "uint256",
      },
    ],
  },
  {
    type: "event",
    name: "ListedForRent",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: false,
        name: "rentPrice",
        type: "uint256",
      },
    ],
  },
  {
    type: "event",
    name: "Delisted",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
    ],
  },
  {
    type: "event",
    name: "HomeSold",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "seller",
        type: "address",
      },
      {
        indexed: true,
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        name: "price",
        type: "uint256",
      },
    ],
  },
  {
    type: "event",
    name: "HomeRented",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "tenant",
        type: "address",
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        name: "leaseEnd",
        type: "uint64",
      },
    ],
  },
  {
    type: "event",
    name: "RentPaid",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "tenant",
        type: "address",
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        name: "leaseEnd",
        type: "uint64",
      },
    ],
  },
  {
    type: "event",
    name: "LeaseEnded",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "homeId",
        type: "uint256",
      },
      {
        indexed: true,
        name: "tenant",
        type: "address",
      },
      {
        indexed: true,
        name: "endedBy",
        type: "address",
      },
    ],
  },
  {
    type: "error",
    name: "EmptyMetadata",
    inputs: [],
  },
  {
    type: "error",
    name: "UnknownHome",
    inputs: [],
  },
  {
    type: "error",
    name: "NotHomeOwner",
    inputs: [],
  },
  {
    type: "error",
    name: "InvalidPrice",
    inputs: [],
  },
  {
    type: "error",
    name: "HomeIsLeased",
    inputs: [],
  },
  {
    type: "error",
    name: "NotForSale",
    inputs: [],
  },
  {
    type: "error",
    name: "NotForRent",
    inputs: [],
  },
  {
    type: "error",
    name: "IncorrectPayment",
    inputs: [
      { name: "expected", type: "uint256" },
      { name: "sent", type: "uint256" },
    ],
  },
  {
    type: "error",
    name: "NotTenant",
    inputs: [],
  },
  {
    type: "error",
    name: "NoActiveLease",
    inputs: [],
  },
  {
    type: "error",
    name: "LeaseNotExpired",
    inputs: [],
  },
  {
    type: "error",
    name: "PayoutFailed",
    inputs: [],
  },
] as const satisfies Abi;
