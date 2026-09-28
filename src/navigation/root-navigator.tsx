import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { colors, fonts } from '../design-system'
import { InstrumentScreen } from '../screens/instrument-screen'
import { TabNavigator } from './tab-navigator'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

/**
 * Native stack throughout. Every screen draws its own header, so the native
 * one is disabled rather than replaced with a JS `header` component.
 */
export function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: CONTENT_STYLE }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Instrument" component={InstrumentScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const CONTENT_STYLE = { backgroundColor: colors.bg }

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    primary: colors.gold,
    border: colors.border,
  },
  fonts: {
    regular: { fontFamily: fonts.regular, fontWeight: '400' },
    medium: { fontFamily: fonts.medium, fontWeight: '500' },
    bold: { fontFamily: fonts.bold, fontWeight: '700' },
    heavy: { fontFamily: fonts.extrabold, fontWeight: '800' },
  },
}
