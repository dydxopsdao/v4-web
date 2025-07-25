/** implemented in useNotificationTypes */
export enum NotificationType {
  // Until we have migrations enabled, we need to keep underlying values the same
  // So the notifications don't get retriggered
  // It's pretty scary getting a bunch of unexpected withdrawal notifications
  SkipTransfer = 'SquidTransfer',
  SkipTransfer2 = 'SkipTransfer2',
  FunkitDeposit = 'FunkitDeposit',
  TriggerOrder = 'TriggerOrder',
  ReleaseUpdates = 'ReleaseUpdates',
  ApiError = 'ApiError',
  AffiliatesAlert = 'AffiliatesAlert',
  ComplianceAlert = 'ComplianceAlert',
  OrderStatus = 'OrderStatus',
  MarketUpdate = 'MarketUpdate',
  RewardsProgramUpdates = 'RewardsProgramUpdates',
  MarketWindDown = 'MarketWindDown',
  FeedbackRequest = 'FeedbackRequest',
  PredictionMarketConcluded = 'PredictionMarketConcluded',
  Custom = 'Custom', // custom notifications triggered by components eg user input errors
  BlockTradingReward = 'BlockTradingReward', // deprecated
  FillWithNoOrder = 'FillWithNoOrder',
  Order = 'Order',
  CosmosWalletLifecycle = 'CosmosWalletLifecycle', // lifecycle events for cosmos wallets
}

export enum NotificationCategoryPreferences {
  Trading = 'Trading', // order status, positions / liquidations, trading rewards
  Transfers = 'Transfers', // transfers
  General = 'General', // release updates
  MustSee = 'MustSee', // cannot be hidden: compliance, api errors
}

export const NotificationCategoryPreferenceOrder = Object.values(NotificationCategoryPreferences);

export const NotificationTypeCategory: {
  [key in NotificationType]: NotificationCategoryPreferences;
} = {
  [NotificationType.ReleaseUpdates]: NotificationCategoryPreferences.General,
  [NotificationType.AffiliatesAlert]: NotificationCategoryPreferences.General,
  [NotificationType.SkipTransfer]: NotificationCategoryPreferences.Transfers,
  [NotificationType.SkipTransfer2]: NotificationCategoryPreferences.Transfers,
  [NotificationType.FunkitDeposit]: NotificationCategoryPreferences.Transfers,
  [NotificationType.BlockTradingReward]: NotificationCategoryPreferences.Trading, // deprecated
  [NotificationType.FillWithNoOrder]: NotificationCategoryPreferences.Trading,
  [NotificationType.Order]: NotificationCategoryPreferences.Trading,
  [NotificationType.TriggerOrder]: NotificationCategoryPreferences.Trading,
  [NotificationType.OrderStatus]: NotificationCategoryPreferences.Trading,
  [NotificationType.ApiError]: NotificationCategoryPreferences.MustSee,
  [NotificationType.ComplianceAlert]: NotificationCategoryPreferences.MustSee,
  [NotificationType.MarketUpdate]: NotificationCategoryPreferences.MustSee,
  [NotificationType.MarketWindDown]: NotificationCategoryPreferences.MustSee,
  [NotificationType.RewardsProgramUpdates]: NotificationCategoryPreferences.MustSee,
  [NotificationType.FeedbackRequest]: NotificationCategoryPreferences.MustSee,
  [NotificationType.PredictionMarketConcluded]: NotificationCategoryPreferences.MustSee,
  [NotificationType.Custom]: NotificationCategoryPreferences.MustSee,
  [NotificationType.CosmosWalletLifecycle]: NotificationCategoryPreferences.MustSee,
};

export const SingleSessionNotificationTypes = [
  NotificationType.ApiError,
  NotificationType.ComplianceAlert,
  NotificationType.OrderStatus,
  NotificationType.Custom,
  NotificationType.CosmosWalletLifecycle,
];

export type NotificationId = string | number;

export type NotificationParams = {
  type: NotificationType;
  id: NotificationId;
};

export type NotificationTypeConfig<
  NotificationIdType extends NotificationId = string,
  NotificationUpdateKey = any,
> = {
  type: NotificationType;

  /** React hook to trigger notifications based on app state */
  useTrigger: (_: {
    trigger: (triggerArgs: {
      /** Unique ID for the triggered notification */
      id: NotificationIdType;

      /** Display data for the triggered notification */
      displayData: NotificationDisplayData;

      /**
       * JSON-serializable key.
       * Re-triggers the notification if passed a different value from the last trigger() call (even from a previous browser session).
       * Suggested usage: data dependency array
       */
      updateKey?: NotificationUpdateKey;

      /**
       * @param true (default): Notification initialized with status NotificationStatus.Triggered
       * @param false: Notification initialized with status NotificationStatus.Cleared
       */
      isNew?: boolean;

      /**
       * @param false (default): Notification should not be retriggered if it's been seen/cleared/hidden
       * @param true:  Notification should be retriggered if status was NotificationStatus.Hidden
       */
      shouldUnhide?: boolean;

      /**
       * If this trigger has a new update key and the notiification status is CLEARED, leave it CLEARED
       * rather than updating it - keep it hidden.
       */
      keepCleared?: boolean;
    }) => void;

    /**
     * Hide (mark clear) a notification based on condition other than user action
     */
    hideNotification: ({ type, id }: NotificationParams) => void;

    lastUpdated: number;

    // timestamp of when app was first ever started
    appInitializedTime: number;

    // timestamp of when this browser session started
    sessionStartTime: number;
  }) => void;

  /** Callback for notification action (Toast action button click, NotificationsMenu item click, or native push notification interaction) */
  useNotificationAction?: () => (id: NotificationIdType) => any;
};

export enum NotificationStatus {
  /** Notification triggered for the first time. Toast timer started. "New" in NotificationsMenu. */
  Triggered,

  /** Notification re-triggered with a different NotificationUpdateKey. Toast timer restarted. "New" in NotificationsMenu. */
  Updated,

  /** Toast timer expired without user interaction. "New" in NotificationsMenu. */
  Unseen,

  /** Toast or NotificationsMenu item interacted with or dismissed. "Seen" in NotificationsMenu. */
  Seen,

  /** Toast or NotificationsMenu item marked as hidden by non-user action. Can be unhidden since it's not explicitly cleared by user. */
  Hidden,

  /** Notification marked for deletion. Hidden in NotificationsMenu. */
  Cleared,
}

/** Notification state. Serialized and cached into localStorage. */
export type Notification<
  NotificationIdType extends NotificationId = string,
  NotificationUpdateKey = any,
> = {
  id: NotificationIdType;
  type: NotificationType;
  status: NotificationStatus;
  timestamps: Partial<Record<NotificationStatus, number>>;
  updateKey: NotificationUpdateKey;
};

export type Notifications = Record<NotificationId, Notification<string, any>>;

/** Notification display data derived from app state at runtime. */
export type NotificationDisplayData = {
  icon?: React.ReactNode;
  title: string; // Title for Toast, Notification, and Push Notification
  body?: string; // Description body for Toast, Notification, and Push Notification
  searchableContent?: string; // never rendered, but searchable

  slotTitleLeft?: React.ReactNode;
  slotTitleRight?: React.ReactNode;

  groupKey: string; // Grouping key toast notification stacking

  // Overrides title/body for Notification in NotificationMenu
  renderCustomBody?: ({
    isToast,
    notification,
  }: {
    isToast?: boolean;
    notification: Notification;
  }) => React.ReactNode; // Custom Notification

  actionDescription?: string;

  renderActionSlot?: ({
    isToast,
    notification,
  }: {
    isToast?: boolean;
    notification: Notification;
  }) => React.ReactNode; // Custom Notification

  // Render function for Simple UI Alerts Page
  renderSimpleAlert?: ({
    className,
    notification,
  }: {
    className?: string;
    notification: Notification;
  }) => React.ReactNode;

  /** Screen reader: instructions for performing toast action after its timer expires */
  actionAltText?: string;

  /**
   * @param foreground
     Screen reader: announces immediately.
     Push notification: vibrates device.
   * @param background
     Screen reader: announces at the next graceful opportunity.
     Push notification: no vibration.
   */
  toastSensitivity?: 'foreground' | 'background';

  /**
   * @param number
     Radix UI Toast: automatically Unseen.
     Push notification: requires interaction.
   * @param Infinity
     Radix UI Toast: no timer.
     Push notification: requires interaction.
   */
  toastDuration?: number;

  withClose?: boolean; // Show close button for Notification

  updatedTime?: number;
};

export type CustomNotification = {
  id: string;
  displayData: NotificationDisplayData;
};

export enum TransferNotificationTypes {
  Withdrawal = 'withdrawal',
  Deposit = 'deposit',
}

export enum CosmosWalletNotificationTypes {
  GasRebalance = 'gas-rebalance',
  CancelOrphanedTriggers = 'cancel-orphaned-triggers',
  ReclaimChildSubaccountFunds = 'reclaim-child-subaccount-funds',
}

export enum ReleaseUpdateNotificationIds {
  DiscoveryProgram = 'discovery-program', // Deprecated
  Twitter200BVolume = 'twitter-200b-volume', // Deprecated
  IncentivesS6Ended = 'incentives-s6-ended', // Deprecated
  KeplrSupport = 'keplr-support', // Deprecated
  PhantomSupport = 'phantom-support', // Deprecated
  SimpleIosExperience = 'simple-ios-experience', // Deprecated
}

// Incentives Season
export enum IncentivesDistributedNotificationIds {
  IncentivesDistributedS6 = 'incentives-distributed-s6',
}

export const INCENTIVES_SEASON_NOTIFICATION_ID = ReleaseUpdateNotificationIds.IncentivesS6Ended;

export function getSeasonRewardDistributionNumber(seasonId: IncentivesDistributedNotificationIds) {
  switch (seasonId) {
    case IncentivesDistributedNotificationIds.IncentivesDistributedS6:
      return 6;
    default:
      return 5;
  }
}

export enum MarketLaunchNotificationIds {
  TrumpWin = 'market-launch-trumpwin', // Deprecated
}

export enum MarketWindDownNotificationIds {
  MarketWindDownFetAgix = 'market-wind-down-fet-agix', // Deprecated
  MarketWindDownProposalFetAgix = 'market-wind-down-proposal-fet-agix', // Deprecated
  MarketUpdateProposalRndr = 'market-update-proposal-rndr', // Deprecated
  MarketWindDownMatic = 'market-wind-down-matic', // Deprecated
  MarketWindDownProposalMatic = 'market-wind-down-proposal-matic', // Deprecated
}

export enum MarketUpdateNotificationIds {
  MarketUpdateSolLiquidityTier = 'market-update-sol-liquidity-tier', // Deprecated
  MarketUpdateProposal226 = 'market-update-proposal-226', // Deprecated
}

export enum FeedbackRequestNotificationIds {
  Top100UserSupport = 'top-100-user-support',
}

/**
 * @description Struct to store whether a NotificationType belonging to each NotificationCategoryType should be triggered
 */
export type NotificationPreferences = {
  [key in NotificationCategoryPreferences]: boolean;
} & { version: string };

export const DEFAULT_TOAST_AUTO_CLOSE_MS = 5000;
export const MAX_NUM_TOASTS = 10; // Max toasts to display on screen
