import { useSelector } from "react-redux";
import { getAmount } from "@/utils/customFunctions";

// Reads currency settings from `state.globalSettings.global` and returns a
// formatter compatible with the bot's price-display call sites (drop-in for
// the 6amMart `getAmountWithSign(amount)` helper that doesn't exist here).
const useFormatAmount = (): ((amount: number | string | null | undefined) => string) => {
  const { global } = useSelector((state: any) => state.globalSettings) ?? {};

  const currencySymbol: string = global?.currency_symbol ?? "";
  const currencySymbolDirection: string = global?.currency_symbol_direction ?? "left";
  const digitAfterDecimalPoint: number = global?.digit_after_decimal_point ?? 2;

  return (amount) =>
    getAmount(
      amount,
      currencySymbolDirection,
      currencySymbol,
      digitAfterDecimalPoint
    );
};

export default useFormatAmount;
