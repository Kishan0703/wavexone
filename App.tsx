import './src/design-system/fonts.css'

import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { BackendProvider } from './src/backend/provider'
import { ActionMenuProvider } from './src/design-system'
import { RootNavigator } from './src/navigation/root-navigator'

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        {/*
         * One backend for the whole app. The duplicate-submission memo lives
         * on the instance, so a second one would let a mutation run twice.
         */}
        <BackendProvider>
          <ActionMenuProvider>
            <RootNavigator />
          </ActionMenuProvider>
        </BackendProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = { root: { flex: 1 } } as const
