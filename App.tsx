import './src/design-system/fonts.css'

import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { ActionMenuProvider } from './src/design-system'
import { RootNavigator } from './src/navigation/root-navigator'

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <ActionMenuProvider>
          <RootNavigator />
        </ActionMenuProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = { root: { flex: 1 } } as const
