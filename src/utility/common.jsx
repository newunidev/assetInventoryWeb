export const BRANCHES = [
  "Hettipola",
  "Bakamuna1",
  "Bakamuna2",
  "Mathara",
  "Welioya",
  "Sample Room",
  "Piliyandala",
  // Add more branches as needed
];

export const CommonStore = {
  pageTitle: "Dashboard", // default page title
};


/**
 * Convert number to Sri Lankan Rupee text (e.g., 1234.56 -> "One Thousand Two Hundred Thirty-Four Rupees and Fifty-Six Cents Only")
 */
export const numberToWords = (amount) => {
  if (!amount) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + numToWords(n % 100) : "");
    if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numToWords(n % 1000) : "");
    if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numToWords(n % 100000) : "");
    return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numToWords(n % 10000000) : "");
  };

  const [rupees, cents] = parseFloat(amount).toFixed(2).split(".");
  const rupeeWords = numToWords(Number(rupees));
  const centWords = Number(cents) > 0 ? ` and ${numToWords(Number(cents))} Cents` : "";

  return `${rupeeWords} Rupees${centWords} Only`;
};
