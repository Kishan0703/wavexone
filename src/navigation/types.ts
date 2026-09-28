import type { NavigatorScreenParams } from '@react-navigation/native'

/** Home tab: the dashboard, plus the "Your Balance" screen it pushes. */
export type HomeStackParamList = {
  Dashboard: undefined
  Balance: undefined
}

/** More tab: the account menu, plus the history it pushes. */
export type MoreStackParamList = {
  Account: undefined
  Activity: undefined
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
}

declare global {
  namespace ReactNavigation {
    // The empty body is the point: this is React Navigation's global type
    // augmentation, which makes `useNavigation()` typed without a generic.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
