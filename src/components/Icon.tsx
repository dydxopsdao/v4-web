import { type ElementType } from 'react';

import styled from 'styled-components';

import {
  AddressConnectorIcon,
  AppleIcon,
  AppleLightIcon,
  ArrowIcon,
  BankIcon,
  Bar3Icon,
  BellIcon,
  BellStrokeIcon,
  BoxCloseIcon,
  CalculatorIcon,
  CaretIcon,
  CautionCircleIcon,
  CautionCircleStrokeIcon,
  ChatIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  CoinMarketCapIcon,
  CoinsIcon,
  CommentIcon,
  CopyIcon,
  CurrencySignIcon,
  Deposit2Icon,
  DepositIcon,
  DepthChartIcon,
  DiscordIcon,
  DownloadIcon,
  EarthIcon,
  ErrorExclamationIcon,
  EtherscanIcon,
  ExportKeysIcon,
  FastForwardIcon,
  FeedbackIcon,
  FileIcon,
  FilterIcon,
  FireIcon,
  FundingChartIcon,
  FunkitInstantIcon,
  FunkitStandardIcon,
  GearIcon,
  GearStrokeIcon,
  GiftboxIcon,
  GoogleIcon,
  GooglePlayIcon,
  GovernanceIcon,
  HelpCircleIcon,
  HideIcon,
  HistoryIcon,
  InfoCircleStrokeIcon,
  InfoIcon,
  LeaderboardIcon,
  LightningIcon,
  LinkOutIcon,
  LiquidationIcon,
  ListIcon,
  LockIcon,
  MarginIcon,
  MarketsIcon,
  MenuIcon,
  MintscanIcon,
  MobileIcon,
  MoneyIcon,
  MoonIcon,
  MoveIcon,
  OrderCanceledIcon,
  OrderFilledIcon,
  OrderOpenIcon,
  OrderPartiallyFilledIcon,
  OrderPendingIcon,
  OrderUntriggeredIcon,
  OrderbookIcon,
  OverviewIcon,
  PasskeyIcon,
  Pencil2Icon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  PositionIcon,
  PositionPartialIcon,
  PositionsIcon,
  PriceChartIcon,
  PriceIcon,
  PrivacyIcon,
  QrIcon,
  QuestionMarkIcon,
  RefreshIcon,
  RocketIcon,
  RoundedArrowIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShareIcon,
  ShieldIcon,
  ShowIcon,
  SocialLoginIcon,
  SocialXIcon,
  SparklesIcon,
  SpeechBubbleIcon,
  StarIcon,
  SuccessCircleIcon,
  SunIcon,
  SwitchIcon,
  TerminalIcon,
  ThreeDotIcon,
  TogglesMenuIcon,
  TokenIcon,
  TradeIcon,
  TransferArrowsIcon,
  TransferIcon,
  TranslateIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleIcon,
  TrophyIcon,
  TryAgainIcon,
  ViewfinderIcon,
  VolumeIcon,
  Wallet2Icon,
  WalletIcon,
  WarningIcon,
  WebsiteIcon,
  WhitepaperIcon,
  WithdrawIcon,
  XCircleIcon,
} from '@/icons';
import { ChaosLabsIcon } from '@/icons/chaos-labs';
import { LogoShortIcon } from '@/icons/logo-short';
import UsdcIcon from '@/icons/usdc.svg';

import { calc } from '@/lib/do';

export enum IconName {
  AddressConnector = 'AddressConnector',
  Apple = 'Apple',
  AppleLight = 'AppleLight',
  Arrow = 'Arrow',
  Bank = 'Bank',
  Bar3 = 'Bar3',
  Bell = 'Bell',
  BellStroked = 'BellStroked',
  BoxClose = 'BoxClose',
  Calculator = 'Calculator',
  Caret = 'Caret',
  CautionCircle = 'CautionCircle',
  CautionCircleStroked = 'CautionCircleStroked',
  ChaosLabs = 'ChaosLabs',
  Chat = 'Chat',
  Check = 'Check',
  CheckCircle = 'CheckCircle',
  ChevronLeft = 'ChevronLeft',
  ChevronRight = 'ChevronRight',
  Clock = 'Clock',
  Close = 'Close',
  CoinMarketCap = 'CoinMarketCap',
  Coins = 'Coins',
  Comment = 'Comment',
  Copy = 'Copy',
  CurrencySign = 'CurrencySign',
  Deposit = 'Deposit',
  Deposit2 = 'Deposit2',
  DepthChart = 'DepthChart',
  Discord = 'Discord',
  Download = 'Download',
  Earth = 'Earth',
  Etherscan = 'Etherscan',
  ErrorExclamation = 'ErrorExclamation',
  ExportKeys = 'ExportKeys',
  FastForward = 'FastForward',
  Feedback = 'Feedback',
  File = 'File',
  Filter = 'Filter',
  Fire = 'Fire',
  FundingChart = 'FundingChart',
  FunkitInstant = 'FunkitInstant',
  FunkitStandard = 'FunkitStandard',
  Gear = 'Gear',
  GearStroke = 'GearStroke',
  Giftbox = 'Giftbox',
  Google = 'Google',
  GooglePlay = 'GooglePlay',
  Governance = 'Governance',
  HelpCircle = 'HelpCircle',
  Hide = 'Hide',
  History = 'History',
  Info = 'Info',
  InfoStroke = 'InfoStroke',
  Leaderboard = 'Leaderboard',
  Lightning = 'Lightning',
  LinkOut = 'LinkOut',
  List = 'List',
  Liquidation = 'Liquidation',
  Lock = 'Lock',
  LogoShort = 'LogoShort',
  Margin = 'Margin',
  Markets = 'Markets',
  Menu = 'Menu',
  Migrate = 'Migrate',
  Mintscan = 'Mintscan',
  Mobile = 'Mobile',
  Money = 'Money',
  Moon = 'Moon',
  Move = 'Move',
  Onboarding = 'Onboarding',
  Orderbook = 'OrderbookIcon',
  OrderCanceled = 'OrderCanceled',
  OrderFilled = 'OrderFilled',
  OrderOpen = 'OrderOpen',
  OrderPartiallyFilled = 'OrderPartiallyFilled',
  OrderPending = 'OrderPending',
  OrderUntriggered = 'OrderUntriggered',
  Overview = 'Overview',
  Passkey = 'Passkey',
  Pencil = 'Pencil',
  Pencil2 = 'Pencil2',
  Play = 'Play',
  Plus = 'Plus',
  PositionPartial = 'PositionPartial',
  Position = 'Position',
  Positions = 'Positions',
  Price = 'Price',
  PriceChart = 'PriceChart',
  Privacy = 'Privacy',
  Qr = 'Qr',
  QuestionMark = 'QuestionMark',
  Refresh = 'Refresh',
  RewardStar = 'RewardStar',
  RewardStars = 'RewardStars',
  Rocket = 'Rocket',
  RoundedArrow = 'RoundedArrow',
  Search = 'Search',
  Send = 'Send',
  Settings = 'Settings',
  Share = 'Share',
  Shield = 'Shield',
  Show = 'Show',
  Sparkles = 'Sparkles',
  SpeechBubble = 'SpeechBubble',
  SocialLogin = 'SocialLogin',
  Star = 'Star',
  SuccessCircle = 'SuccessCircle',
  Sun = 'Sun',
  Switch = 'Switch',
  Terminal = 'Terminal',
  ThreeDot = 'ThreeDot',
  TogglesMenu = 'TogglesMenu',
  Token = 'Token',
  Trade = 'Trade',
  Transfer = 'Transfer',
  TransferArrows = 'TransferArrows',
  Translate = 'Translate',
  TrendingDown = 'TrendingDown',
  TrendingUp = 'TrendingUp',
  Triangle = 'Triangle',
  Trophy = 'Trophy',
  TryAgain = 'TryAgain',
  Usdc = 'Usdc',
  Viewfinder = 'Viewfinder',
  Volume = 'Volume',
  Wallet = 'Wallet',
  Wallet2 = 'Wallet2',
  Warning = 'Warning',
  Website = 'Website',
  Whitepaper = 'Whitepaper',
  Withdraw = 'Withdraw',
  XCircle = 'XCircle',
  SocialX = 'SocialX',
}

const icons = {
  [IconName.AddressConnector]: AddressConnectorIcon,
  [IconName.Apple]: AppleIcon,
  [IconName.AppleLight]: AppleLightIcon,
  [IconName.Arrow]: ArrowIcon,
  [IconName.Bank]: BankIcon,
  [IconName.Bar3]: Bar3Icon,
  [IconName.Bell]: BellIcon,
  [IconName.BellStroked]: BellStrokeIcon,
  [IconName.BoxClose]: BoxCloseIcon,
  [IconName.Calculator]: CalculatorIcon,
  [IconName.Caret]: CaretIcon,
  [IconName.CautionCircle]: CautionCircleIcon,
  [IconName.CautionCircleStroked]: CautionCircleStrokeIcon,
  [IconName.ChaosLabs]: ChaosLabsIcon,
  [IconName.Chat]: ChatIcon,
  [IconName.Check]: CheckIcon,
  [IconName.CheckCircle]: CheckCircleIcon,
  [IconName.ChevronLeft]: ChevronLeftIcon,
  [IconName.ChevronRight]: ChevronRightIcon,
  [IconName.Clock]: ClockIcon,
  [IconName.Close]: CloseIcon,
  [IconName.CoinMarketCap]: CoinMarketCapIcon,
  [IconName.Coins]: CoinsIcon,
  [IconName.Comment]: CommentIcon,
  [IconName.Copy]: CopyIcon,
  [IconName.CurrencySign]: CurrencySignIcon,
  [IconName.Deposit]: DepositIcon,
  [IconName.Deposit2]: Deposit2Icon,
  [IconName.DepthChart]: DepthChartIcon,
  [IconName.Discord]: DiscordIcon,
  [IconName.Download]: DownloadIcon,
  [IconName.Earth]: EarthIcon,
  [IconName.ErrorExclamation]: ErrorExclamationIcon,
  [IconName.Etherscan]: EtherscanIcon,
  [IconName.ExportKeys]: ExportKeysIcon,
  [IconName.FastForward]: FastForwardIcon,
  [IconName.Feedback]: FeedbackIcon,
  [IconName.File]: FileIcon,
  [IconName.Filter]: FilterIcon,
  [IconName.Fire]: FireIcon,
  [IconName.FundingChart]: FundingChartIcon,
  [IconName.FunkitInstant]: FunkitInstantIcon,
  [IconName.FunkitStandard]: FunkitStandardIcon,
  [IconName.Gear]: GearIcon,
  [IconName.GearStroke]: GearStrokeIcon,
  [IconName.Giftbox]: GiftboxIcon,
  [IconName.Google]: GoogleIcon,
  [IconName.GooglePlay]: GooglePlayIcon,
  [IconName.Governance]: GovernanceIcon,
  [IconName.HelpCircle]: HelpCircleIcon,
  [IconName.Hide]: HideIcon,
  [IconName.History]: HistoryIcon,
  [IconName.Info]: InfoIcon,
  [IconName.InfoStroke]: InfoCircleStrokeIcon,
  [IconName.Leaderboard]: LeaderboardIcon,
  [IconName.Lightning]: LightningIcon,
  [IconName.LinkOut]: LinkOutIcon,
  [IconName.List]: ListIcon,
  [IconName.Liquidation]: LiquidationIcon,
  [IconName.Lock]: LockIcon,
  [IconName.LogoShort]: LogoShortIcon,
  [IconName.Margin]: MarginIcon,
  [IconName.Markets]: MarketsIcon,
  [IconName.Menu]: MenuIcon,
  [IconName.Mintscan]: MintscanIcon,
  [IconName.Mobile]: MobileIcon,
  [IconName.Money]: MoneyIcon,
  [IconName.Moon]: MoonIcon,
  [IconName.Move]: MoveIcon,
  [IconName.Passkey]: PasskeyIcon,
  [IconName.Orderbook]: OrderbookIcon,
  [IconName.OrderCanceled]: OrderCanceledIcon,
  [IconName.OrderFilled]: OrderFilledIcon,
  [IconName.OrderOpen]: OrderOpenIcon,
  [IconName.OrderPartiallyFilled]: OrderPartiallyFilledIcon,
  [IconName.OrderPending]: OrderPendingIcon,
  [IconName.OrderUntriggered]: OrderUntriggeredIcon,
  [IconName.Overview]: OverviewIcon,
  [IconName.Pencil]: PencilIcon,
  [IconName.Pencil2]: Pencil2Icon,
  [IconName.Play]: PlayIcon,
  [IconName.Plus]: PlusIcon,
  [IconName.PositionPartial]: PositionPartialIcon,
  [IconName.Position]: PositionIcon,
  [IconName.Positions]: PositionsIcon,
  [IconName.Price]: PriceIcon,
  [IconName.PriceChart]: PriceChartIcon,
  [IconName.Privacy]: PrivacyIcon,
  [IconName.Qr]: QrIcon,
  [IconName.QuestionMark]: QuestionMarkIcon,
  [IconName.Refresh]: RefreshIcon,
  [IconName.RewardStar]: undefined,
  [IconName.Rocket]: RocketIcon,
  [IconName.RoundedArrow]: RoundedArrowIcon,
  [IconName.Search]: SearchIcon,
  [IconName.Send]: SendIcon,
  [IconName.Settings]: SettingsIcon,
  [IconName.Share]: ShareIcon,
  [IconName.Shield]: ShieldIcon,
  [IconName.Show]: ShowIcon,
  [IconName.Sparkles]: SparklesIcon,
  [IconName.SpeechBubble]: SpeechBubbleIcon,
  [IconName.SocialLogin]: SocialLoginIcon,
  [IconName.Star]: StarIcon,
  [IconName.SuccessCircle]: SuccessCircleIcon,
  [IconName.Sun]: SunIcon,
  [IconName.Switch]: SwitchIcon,
  [IconName.Terminal]: TerminalIcon,
  [IconName.ThreeDot]: ThreeDotIcon,
  [IconName.TogglesMenu]: TogglesMenuIcon,
  [IconName.Token]: TokenIcon,
  [IconName.Trade]: TradeIcon,
  [IconName.Transfer]: TransferIcon,
  [IconName.TransferArrows]: TransferArrowsIcon,
  [IconName.Translate]: TranslateIcon,
  [IconName.TrendingDown]: TrendingDownIcon,
  [IconName.TrendingUp]: TrendingUpIcon,
  [IconName.Triangle]: TriangleIcon,
  [IconName.Trophy]: TrophyIcon,
  [IconName.TryAgain]: TryAgainIcon,
  [IconName.Usdc]: UsdcIcon,
  [IconName.Viewfinder]: ViewfinderIcon,
  [IconName.Volume]: VolumeIcon,
  [IconName.Wallet]: WalletIcon,
  [IconName.Wallet2]: Wallet2Icon,
  [IconName.Warning]: WarningIcon,
  [IconName.Website]: WebsiteIcon,
  [IconName.Whitepaper]: WhitepaperIcon,
  [IconName.Withdraw]: WithdrawIcon,
  [IconName.XCircle]: XCircleIcon,
  [IconName.SocialX]: SocialXIcon,
} as Record<IconName, ElementType | undefined>;

// we load reward-start async because it's gigantic for some reason
calc(async () => {
  icons[IconName.RewardStar] = (await import('@/icons/reward-star.svg')).default as ElementType;
  icons[IconName.RewardStars] = (await import('@/icons/rewards-stars.svg')).default as ElementType;
});

type ElementProps = {
  iconName?: IconName;
  iconComponent?: ElementType;
};

type StyleProps = {
  className?: string;
  size?: string;
};

export const Icon = styled(
  ({
    iconName,
    iconComponent: Component = iconName && icons[iconName],
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    size,
    ...props
  }: ElementProps & StyleProps) =>
    Component ? <Component className={className} {...props} /> : null
)`
  --icon-size: ${({ size }) => size ?? ''};
  width: var(--icon-size, 1em);
  height: var(--icon-size, 1em);
  min-width: var(--icon-size, 1em);
  min-height: var(--icon-size, 1em);
`;
