import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { colors } from '../design-system'
import { AccountScreen } from '../screens/account-screen'
import { ActivityScreen } from '../screens/activity-screen'
import { BalanceScreen } from '../screens/balance-screen'
import { HomeScreen } from '../screens/home-screen'
import { MarketsScreen } from '../screens/markets-screen'
import { PositionsScreen } from '../screens/positions-screen'
import { TradeScreen } from '../screens/trade-screen'
import { TabBar } from './tab-bar'
import type { HomeStackParamList, MoreStackParamList, TabParamList } from './types'

const Tab = createBottomTabNavigator<TabParamList>()
const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const MoreStack = createNativeStackNavigator<MoreStackParamList>()

const STACK_OPTIONS = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.bg },
} as const

/** Balance keeps the tab bar visible, so it is pushed inside the Home tab. */
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={STACK_OPTIONS}>
      <HomeStack.Screen name="Dashboard" component={HomeScreen} />
      <HomeStack.Screen name="Balance" component={BalanceScreen} />
    </HomeStack.Navigator>
  )
}

/** Same for Activity, which the account menu reaches through Funds. */
function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={STACK_OPTIONS}>
      <MoreStack.Screen name="Account" component={AccountScreen} />
      <MoreStack.Screen name="Activity" component={ActivityScreen} />
    </MoreStack.Navigator>
  )
}

/** Renders `TabBar` — see the note there on why this is not a native tab bar. */
export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={renderTabBar}
      screenOptions={{ headerShown: false, sceneStyle: SCENE_STYLE }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="Markets" component={MarketsScreen} options={{ title: 'Markets' }} />
      <Tab.Screen name="Trade" component={TradeScreen} options={{ title: 'Trade' }} />
      <Tab.Screen name="Positions" component={PositionsScreen} options={{ title: 'Positions' }} />
      <Tab.Screen name="More" component={MoreStackNavigator} options={{ title: 'More' }} />
    </Tab.Navigator>
  )
}

const SCENE_STYLE = { backgroundColor: colors.bg }

const renderTabBar = (props: React.ComponentProps<typeof TabBar>) => <TabBar {...props} />
