import { OrderSide } from '@dydxprotocol/v4-client-js';
import { DateTime } from 'luxon';
import {
  ChartPropertiesOverrides,
  Timezone,
  TradingTerminalFeatureset,
  TradingTerminalWidgetOptions,
} from 'public/tradingview/charting_library';

import { MetadataServiceCandlesResponse } from '@/constants/assetMetadata';
import { Candle, TradingViewChartBar, TradingViewSymbol } from '@/constants/candles';
import { THEME_NAMES } from '@/constants/styles/colors';
import type { ChartLineType } from '@/constants/tvchart';

import { Themes } from '@/styles/themes';

import { AppTheme, type AppColorMode } from '@/state/appUiConfigs';

import { getDisplayableTickerFromMarket } from '../assetUtils';

// Show order book candles instead of trade candles if there are no trades in that time period
const MAX_NUM_TRADES_FOR_ORDERBOOK_PRICES = 1;

const getOhlcValues = ({
  trades,
  tradeOpen,
  tradeClose,
  tradeLow,
  tradeHigh,
  orderbookOpen,
  orderbookClose,
}: {
  trades: number;
  tradeOpen: number;
  tradeClose: number;
  tradeLow: number;
  tradeHigh: number;
  orderbookOpen?: number;
  orderbookClose?: number;
}) => {
  const showOrderbookCandles =
    trades <= MAX_NUM_TRADES_FOR_ORDERBOOK_PRICES &&
    orderbookOpen !== undefined &&
    orderbookClose !== undefined;

  return {
    low: showOrderbookCandles ? Math.min(orderbookOpen, orderbookClose) : tradeLow,
    high: showOrderbookCandles ? Math.max(orderbookOpen, orderbookClose) : tradeHigh,
    open: showOrderbookCandles ? orderbookOpen : tradeOpen,
    close: showOrderbookCandles ? orderbookClose : tradeClose,
  };
};

export const mapMetadataServiceCandles = (
  candle: MetadataServiceCandlesResponse[string][number]
) => {
  return {
    time: new Date(candle.time).getTime(),
    open: candle.open,
    close: candle.close,
    high: candle.high,
    low: candle.low,
    volume: candle.volume,
  };
};

export const mapCandle = ({
  startedAt,
  open,
  close,
  high,
  low,
  baseTokenVolume,
  usdVolume,
  trades,
  orderbookMidPriceOpen,
  orderbookMidPriceClose,
}: Candle): TradingViewChartBar => {
  const tradeOpen = parseFloat(open);
  const tradeClose = parseFloat(close);
  const tradeLow = parseFloat(low);
  const tradeHigh = parseFloat(high);
  const orderbookOpen = orderbookMidPriceOpen ? parseFloat(orderbookMidPriceOpen) : undefined;
  const orderbookClose = orderbookMidPriceClose ? parseFloat(orderbookMidPriceClose) : undefined;
  const tokenVolume = Math.ceil(Number(baseTokenVolume)); // default
  return {
    ...getOhlcValues({
      trades,
      tradeOpen,
      tradeClose,
      tradeLow,
      tradeHigh,
      orderbookOpen,
      orderbookClose,
    }),
    time: new Date(startedAt).getTime(),
    volume: Math.ceil(Number(usdVolume)),
    assetVolume: tokenVolume,
    usdVolume: Math.ceil(Number(usdVolume)),
    tradeOpen,
    tradeClose,
    orderbookOpen,
    orderbookClose,
    tradeLow,
    tradeHigh,
    trades,
  };
};

export const getSymbol = (marketId: string): TradingViewSymbol => ({
  description: marketId,
  exchange: 'dYdX',
  full_name: getDisplayableTickerFromMarket(marketId),
  symbol: marketId,
  type: 'crypto',
});

export const getChartLineColors = ({
  appTheme,
  appColorMode,
  chartLineType,
}: {
  appTheme: AppTheme;
  appColorMode: AppColorMode;
  chartLineType: ChartLineType;
}) => {
  const theme = Themes[appTheme][appColorMode];
  const orderColors = {
    [OrderSide.BUY]: theme.positive,
    [OrderSide.SELL]: theme.negative,
    entry: null,
    liquidation: theme.warning,
  };

  return {
    maybeQuantityColor: orderColors[chartLineType],
    borderColor: theme.borderDefault,
    backgroundColor: theme.layer1,
    textColor: theme.textTertiary,
    textButtonColor: theme.textButton,
  };
};

const timezone = DateTime.local().get('zoneName') as unknown as Timezone;

export const getWidgetOverrides = ({
  appTheme,
  appColorMode,
  isSimpleUi,
}: {
  appTheme: AppTheme;
  appColorMode: AppColorMode;
  isSimpleUi?: boolean;
}) => {
  const theme = Themes[appTheme][appColorMode];

  return {
    theme: THEME_NAMES[appTheme],
    overrides: {
      'paneProperties.background': theme.layer2,
      'paneProperties.horzGridProperties.color': theme.layer3,
      'paneProperties.vertGridProperties.color': theme.layer3,
      'paneProperties.crossHairProperties.style': 1,
      'paneProperties.legendProperties.showBarChange': false,
      'paneProperties.backgroundType': 'solid' as const,
      priceScaleSelectionStrategyName: isSimpleUi ? 'left' : 'right',
      'mainSeriesProperties.style': 1,
      'mainSeriesProperties.candleStyle.upColor': theme.positive,
      'mainSeriesProperties.candleStyle.borderUpColor': theme.positive,
      'mainSeriesProperties.candleStyle.wickUpColor': theme.positive,
      'mainSeriesProperties.candleStyle.downColor': theme.negative,
      'mainSeriesProperties.candleStyle.borderDownColor': theme.negative,
      'mainSeriesProperties.candleStyle.wickDownColor': theme.negative,
      'mainSeriesProperties.statusViewStyle.symbolTextSource': 'ticker',

      'scalesProperties.textColor': theme.textPrimary,
      'scalesProperties.backgroundColor': theme.layer2,
      'scalesProperties.lineColor': theme.layer3,
      'scalesProperties.fontSize': 12,
    } satisfies Partial<ChartPropertiesOverrides>,
    studies_overrides: {
      'volume.volume.color.0': theme.negative,
      'volume.volume.color.1': theme.positive,
      'volume.volume ma.visible': false,
      'relative strength index.plot.color': theme.accent,
      'relative strength index.plot.linewidth': 1.5,
      'relative strength index.hlines background.color': '#134A9F',
    },
    loading_screen: {
      backgroundColor: theme.layer2,
      foregroundColor: theme.layer2,
    },
  };
};

export const getWidgetOptions = (
  isViewingUnlaunchedMarket?: boolean,
  isSimpleUi?: boolean,
  isTablet?: boolean
): Partial<TradingTerminalWidgetOptions> & Pick<TradingTerminalWidgetOptions, 'container'> => {
  const disabledFeaturesForUnlaunchedMarket: TradingTerminalFeatureset[] = [
    'chart_scroll',
    'chart_zoom',
  ];

  const disabledFeaturesForSimpleUi: TradingTerminalFeatureset[] = [
    'header_widget',
    'left_toolbar',
    'display_market_status',
    'legend_widget',
  ];

  const disabledFeatures: TradingTerminalFeatureset[] = [
    'header_symbol_search',
    'header_compare',
    'symbol_search_hot_key',
    'symbol_info',
    'go_to_date',
    'timeframes_toolbar',
    'header_layouttoggle',
    'trading_account_manager',
    ...(isViewingUnlaunchedMarket ? disabledFeaturesForUnlaunchedMarket : []),
    ...(isSimpleUi ? disabledFeaturesForSimpleUi : []),
  ];

  // Needed for iframe loading on some mobile browsers
  const tabletFeatures: TradingTerminalFeatureset[] = isTablet
    ? ['iframe_loading_compatibility_mode' as const]
    : [];

  return {
    // debug: true,
    container: 'tv-price-chart',
    library_path: '/tradingview/', // relative to public folder
    custom_css_url: '/tradingview/custom-styles.css',
    custom_font_family: "'Satoshi', system-ui, -apple-system, Helvetica, Arial, sans-serif",
    autosize: true,
    disabled_features: disabledFeatures,
    timezone,
    enabled_features: [
      'remove_library_container_border',
      'hide_last_na_study_output',
      'dont_show_boolean_study_arguments',
      'hide_left_toolbar_by_default',
      'hide_right_toolbar',
      ...tabletFeatures,
    ],
  };
};

export const getSavedResolution = ({ savedConfig }: { savedConfig?: object }): string | null => {
  // @ts-ignore
  const sources = (savedConfig?.charts ?? []).flatMap((chart: { panes: any[] }) =>
    chart.panes.flatMap((pane) => pane.sources)
  );

  const savedResolution = sources.find(
    (source: { type: string; state: { interval: string | null } }) => source.type === 'MainSeries'
  )?.state?.interval;

  return savedResolution ?? undefined;
};
