import type { NavigatorScreenParams } from '@react-navigation/native'

import type { FundingMode } from '../data/types'

/** Home tab: the dashboard and everything it pushes. */
export type HomeStackParamList = {
  Dashboard: undefined
  /** "Your Balance" — funding actions plus Market Watch. */
  Balance: undefined
  Notifications: undefined
  Signals: undefined
}

/** More tab: the account menu and everything it pushes. */
export type MoreStackParamList = {
  Account: undefined
  Activity: undefined
  Profile: undefined
  Settings: undefined
}

export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined
  Markets: undefined
  Trade: { instrumentId?: string } | undefined
  Positions: undefined
  More: NavigatorScreenParams<MoreStackParamList> | undefined
}

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined
  /**
   * Instrument detail sits above the tabs: the mockup replaces the tab bar
   * with the Sell / Buy pair.
   */
  Instrument: { instrumentId: string }

  /* Presented as native form sheets. */
  Funding: { mode: FundingMode }
  OrderTicket: { instrumentId: string; side: 'Buy' | 'Sell' }
  AccountSwitcher: undefined
  InstrumentPicker: undefined
}

declare global {
  namespace ReactNavigation {
    // The empty body is the point: this is React Navigation's global type
    // augmentation, which makes `useNavigation()` typed without a generic.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
