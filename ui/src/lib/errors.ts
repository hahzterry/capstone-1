import { BaseError, ContractFunctionRevertedError } from "viem";
import { formatUsdc } from "./format";

const revertMessages: Record<string, string> = {
  EmptyMetadata: "Name and location are both required.",
  UnknownHome: "There is no home with that id.",
  NotHomeOwner: "Only the landlord of this home can do that.",
  InvalidPrice: "The price has to be greater than zero.",
  HomeIsLeased: "This home has an active lease.",
  NotForSale: "This home is not listed for sale.",
  NotForRent: "This home is not listed for rent.",
  NotTenant: "Only the tenant of this home can do that.",
  NoActiveLease: "There is no lease to end.",
  LeaseNotExpired: "The lease has to run out before the landlord can end it.",
  PayoutFailed: "The payment to the recipient could not be delivered.",
};

export function readableError(error: unknown): string {
  if (error instanceof BaseError) {
    const reverted = error.walk((e) => e instanceof ContractFunctionRevertedError);

    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName;

      if (name === "IncorrectPayment") {
        const [expected] = (reverted.data?.args ?? []) as [bigint];
        return `Send exactly ${formatUsdc(expected)} USDC.`;
      }
      if (name) return revertMessages[name] ?? name;
    }

    return error.shortMessage || error.message;
  }

  return error instanceof Error ? error.message : "Something went wrong.";
}
