import { TOOLTIP_STRING_KEYS, type TooltipStrings } from '@/constants/localization';

export const tradeChartTooltips = {
  ohlc: ({ stringGetter }) => ({
    title: stringGetter({ key: TOOLTIP_STRING_KEYS.OHLC_TITLE }),
    body: stringGetter({ key: TOOLTIP_STRING_KEYS.OHLC_BODY }),
  }),
} satisfies TooltipStrings;
