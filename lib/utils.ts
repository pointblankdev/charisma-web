import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shortens a blockchain address to a more readable format
 * @param address The full address to shorten
 * @param chars Number of characters to show at start and end (default: 4)
 * @returns Shortened address with ellipsis in the middle
 * @example
 * shortenAddress("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS")
 * // Returns: "SP2Z...55KS"
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2) return address;

  const prefix = address.slice(0, chars);
  const suffix = address.slice(-chars);
  return `${prefix}...${suffix}`;
}

// window.dispatchEvent(new CustomEvent('blazeDeposit', {
//   detail: {
//       token,
//       amount: Number(amount),
//       action: 'deposit'
//   }
// }));
// window.dispatchEvent(new CustomEvent('blazeWithdraw', {
//   detail: {
//       token,
//       amount: Number(amount),
//       action: 'withdraw'
//   }
// }));