export type FaqItem = readonly [question: string, answer: string];

export const SAVINGS_GOAL_FAQS: readonly FaqItem[] = [
  [
    "How is the required monthly savings deposit calculated?",
    "The calculator uses the future value of an annuity formula (Annuity Due for beginning-of-period deposits, Ordinary Annuity for end-of-period). It first calculates how much your starting balance will naturally grow via compounding, subtracts that from your target goal, and solves for the regular periodic contribution needed to bridge the remaining gap.",
  ],
  [
    "What is the difference between beginning and end of period deposits?",
    "Depositing at the beginning of each month gives that contribution an extra month of interest compounding, resulting in a slightly lower required periodic payment compared to depositing at the end of the month.",
  ],
  [
    "Does this calculator account for inflation and taxes?",
    "This baseline calculator displays nominal growth based on your estimated annual return. If saving in a taxable account, taxes on interest or capital gains will reduce your net return, meaning you may need to target a slightly higher deposit.",
  ],
  [
    "What happens if my starting balance is already enough?",
    "If your initial balance compounded over the chosen time horizon meets or exceeds your goal, the required deposit drops to $0.00, and the tool reflects the projected future value of your initial principal.",
  ],
] as const;
