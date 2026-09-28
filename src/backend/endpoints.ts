/**
 * Every endpoint the client is allowed to reach, and the ones it must refuse.
 *
 * Screens never name an endpoint. This registry is the only place collection
 * names appear, which is what makes guide §6.7 ("explicitly deny legacy
 * routes in the client adapter") and §9 ("legacy and unsafe endpoints are
 * blocked by the client module") checkable rather than aspirational.
 */

/** Which transport an endpoint belongs to — they authenticate differently. */
export type Transport = 'trading' | 'portal' | 'charting'

/** Guide §8. Nothing above the configured phase may be called. */
export type Phase = 1 | 2 | 3 | 4

export type EndpointSpec = {
  transport: Transport
  /** `collect=` value for trading, path segment for portal. */
  name: string
  method: 'GET' | 'POST'
  /**
   * Changes server state. Guide §6.4: these are never retried automatically,
   * never prefetched, never cached, never replayed.
   */
  mutation: boolean
  /** Lowest delivery phase that may call this. Guide §8. */
  phase: Phase
  /**
   * The method above is inferred, not documented. Guide §7.6 asks the backend
   * team for request/response examples; until those arrive an unconfirmed
   * *mutation* is refused unless explicitly opted into.
   */
  unconfirmedMethod?: true
}

/**
 * Guide §6.5, §6.6, §6.7. Reaching any of these is a bug, so they are named
 * here with the reason rather than simply left out — a missing entry reads as
 * an oversight, a denial reads as a decision.
 */
export const DENIED_ENDPOINTS: Readonly<Record<string, string>> = {
  swapFunctionality:
    'Blocked: the backend team has documented SQL-injection and transaction-safety problems here (guide §6.5). Do not enable until they confirm a fix.',
  sendnotification:
    'Blocked: notifications must not be sent from the client application (guide §6.6).',
  transferBalance: 'Blocked legacy route — use `funds.transfer` (apiTransfer) instead (guide §4.7).',
  getPayoutInfo:
    'Blocked legacy route — use `funds.configuration` (apiRedeemConfig) instead (guide §4.7).',
  getPayinInfo:
    'Blocked legacy route — use `funds.configuration` (apiRedeemConfig) instead (guide §4.7).',
}

const trading = (
  name: string,
  method: 'GET' | 'POST',
  mutation: boolean,
  phase: Phase,
  unconfirmedMethod?: true,
): EndpointSpec => ({ transport: 'trading', name, method, mutation, phase, unconfirmedMethod })

const portal = (
  name: string,
  method: 'GET' | 'POST',
  mutation: boolean,
  phase: Phase,
  unconfirmedMethod?: true,
): EndpointSpec => ({ transport: 'portal', name, method, mutation, phase, unconfirmedMethod })

/**
 * Methods marked `unconfirmedMethod` are inferred from the API's dispatch
 * style (`v1.php?collect=…` reads as GET) rather than from the collection.
 * Guide §4.5 warns that several mutations really are GET, so the flag records
 * what we know instead of hiding the guess.
 */
export const ENDPOINTS = {
  // §4.1 Authentication
  check: trading('check', 'POST', false, 1),
  bearer: trading('bearer', 'POST', false, 1),
  auth: trading('auth', 'GET', false, 1),
  reauthenticate: trading('reauthenticate', 'POST', false, 1, true),
  register: trading('register', 'POST', true, 3, true),
  mail: trading('mail', 'POST', true, 3, true),
  sendOtp: trading('sentotp', 'POST', true, 3, true),
  savePassword: trading('savepass', 'POST', true, 3, true),

  // §4.2 Home and accounts
  getUser: trading('getuser', 'GET', false, 1, true),
  accountList: trading('accountList', 'GET', false, 1, true),
  ordersCount: trading('orderscount', 'GET', false, 1, true),
  switchAccountTrading: trading('switchAccount', 'GET', true, 1, true),
  bootstrap: portal('apiBootstrap', 'GET', false, 1, true),
  switchAccountPortal: portal('switchAccount', 'POST', true, 1, true),
  requestAccountCreation: portal('apiRequestAccountCreation', 'POST', true, 3, true),
  addAccount: portal('apiAddAccount', 'POST', true, 3, true),
  createDemoAccount: portal('apiCreateDemoAccount', 'POST', true, 3, true),
  leverageOptions: portal('apiLeverageOptions', 'GET', false, 1, true),
  changeLeverage: portal('apiChangeLeverage', 'POST', true, 3, true),

  // §4.3 Markets and watchlist
  watch: trading('watch', 'GET', false, 1, true),
  marketWatch: trading('mwatch', 'GET', false, 1, true),
  symbolSpread: trading('symbolSpreadApp', 'GET', false, 1, true),
  instrumentDetail: trading('detail', 'GET', false, 1, true),
  instrumentDetailPost: trading('detailPost', 'POST', false, 1, true),
  userGroup: trading('userGroup', 'GET', false, 1, true),
  favorites: trading('getfav', 'GET', false, 1, true),
  toggleFavorite: trading('favourite', 'GET', true, 1, true),
  updateFavorite: trading('updateFavorite', 'GET', true, 1, true),
  currentDayData: trading('getCurrentDayData', 'GET', false, 1, true),
  forexMargin: trading('forexmargin', 'GET', false, 2, true),

  // §4.4 Charts
  chartConfig: {
    transport: 'charting',
    name: 'charting_library_cloned_data',
    method: 'GET',
    mutation: false,
    phase: 1,
    unconfirmedMethod: true,
  } satisfies EndpointSpec,
  chartBars: {
    transport: 'charting',
    name: 'watchlist_charting',
    method: 'GET',
    mutation: false,
    phase: 1,
    unconfirmedMethod: true,
  } satisfies EndpointSpec,

  // §4.5 Orders and positions
  orders: trading('orders', 'GET', false, 1, true),
  singleOrder: trading('singleorder', 'GET', false, 1, true),
  closedHistory: trading('history_of_closed_orders', 'GET', false, 1, true),
  placeOrder: trading('placeorder', 'GET', true, 2, true),
  modifyOrder: trading('mobileapp_modifyorder', 'GET', true, 2, true),
  modifyPendingOrder: trading('mobileapp_modifypendingorder', 'GET', true, 2, true),
  cancelStopLossTakeProfit: trading('cancelsltpvalue', 'GET', true, 2, true),
  closePosition: trading('squareoff', 'GET', true, 2, true),
  bulkClosePositions: trading('bulkPositionclose', 'GET', true, 2, true),
  bulkCancelPending: trading('bulkPendingPositionclose', 'GET', true, 2, true),

  // §4.6 Activity and history
  fundingHistory: portal('payout_in_out', 'GET', false, 1, true),
  redeemHistory: portal('apiRedeemHistory', 'GET', false, 1, true),
  transfers: portal('apiTransfers', 'GET', false, 1, true),
  walletHistory: portal('apiWalletHistory', 'GET', false, 1, true),

  // §4.7 Funds
  redeemConfig: portal('apiRedeemConfig', 'GET', false, 1, true),
  saveWithdrawDetails: portal('apiSaveWithdrawDetails', 'POST', true, 3, true),
  sendWithdrawOtp: portal('apiSendWithdrawOtp', 'POST', true, 3, true),
  submitWithdraw: portal('apiSubmitWithdraw', 'POST', true, 3, true),
  submitDeposit: portal('apiSubmitDeposit', 'POST', true, 3, true),
  transfer: portal('apiTransfer', 'POST', true, 3, true),
  submitDemoDeposit: portal('submitDemoDeposit', 'POST', true, 3, true),

  // §4.8 Account and More
  saveProfile: portal('apiSaveProfile', 'POST', true, 3, true),
  notifications: portal('apiNotifications', 'GET', false, 1, true),
  markNotificationsRead: portal('apiNotificationsRead', 'POST', true, 1, true),
  referrals: portal('apiReferrals', 'GET', false, 1, true),
  referralHierarchy: portal('apiReferralHierarchy', 'GET', false, 1, true),

  // Portal session bootstrap — §3.2
  setPortalSession: portal('setPortalSession', 'POST', false, 1),
} as const satisfies Record<string, EndpointSpec>

export type EndpointKey = keyof typeof ENDPOINTS
