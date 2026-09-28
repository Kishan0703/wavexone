import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
  Avatar,
  Card,
  ChevronRightIcon,
  CodeIcon,
  ExternalLinkIcon,
  Gutter,
  HeadsetIcon,
  Logo,
  LogoutIcon,
  MarketsIcon,
  Pressable,
  Screen,
  SettingsIcon,
  SwapIcon,
  TAB_BAR_CLEARANCE,
  Text,
  UserIcon,
  VerifiedIcon,
  WalletIcon,
  colors,
} from '../design-system'
import { SettingsGroup, SettingsRow } from '../features/account/settings-row'
import { account } from '../data/mock'
import type { MoreStackParamList } from '../navigation/types'

type Navigation = NativeStackNavigationProp<MoreStackParamList, 'Account'>

/** More tab: identity card, the two menu groups, and the support banner. */
export function AccountScreen() {
  const { navigate } = useNavigation<Navigation>()
  const openActivity = () => navigate('Activity')

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Gutter style={styles.masthead}>
          <Logo size={21} />
          <Text variant="heading" style={styles.mastheadTitle}>
            Account
          </Text>
        </Gutter>

        <Gutter>
          <Pressable accessibilityRole="button">
            <Card style={styles.profile}>
              <Avatar uri={account.avatarUrl} size={76} />
              <View style={styles.profileIdentity}>
                <View style={styles.profileName}>
                  <Text variant="heading" style={styles.profileNameText}>
                    {account.holder}
                  </Text>
                  {account.verified ? <VerifiedIcon size={20} /> : null}
                </View>
                <Text variant="body" color={colors.textMuted}>
                  {account.mode} account
                </Text>
                <Text variant="body" color={colors.textMuted}>
                  {account.number}
                </Text>
              </View>
              <ChevronRightIcon size={22} color={colors.text} />
            </Card>
          </Pressable>
        </Gutter>

        <Gutter>
          <SettingsGroup>
            <SettingsRow
              icon={<WalletIcon size={24} color={colors.text} />}
              label="Funds"
              onPress={openActivity}
            />
            <SettingsRow
              icon={<UserIcon size={24} color={colors.text} />}
              label="Profile & verification"
            />
            <SettingsRow
              icon={<MarketsIcon size={24} color={colors.text} filled />}
              label="Trading signals"
            />
            <SettingsRow
              icon={<ExternalLinkIcon size={24} color={colors.text} />}
              label="Client portal"
            />
            <SettingsRow icon={<CodeIcon size={24} color={colors.text} />} label="API access" />
            <SettingsRow
              icon={<HeadsetIcon size={24} color={colors.text} />}
              label="Support"
              divider={false}
            />
          </SettingsGroup>
        </Gutter>

        <Gutter>
          <SettingsGroup>
            <SettingsRow icon={<SettingsIcon size={24} color={colors.text} />} label="Settings" />
            <SettingsRow icon={<SwapIcon size={24} color={colors.text} />} label="Switch account" />
            <SettingsRow
              icon={<LogoutIcon size={24} color={colors.text} />}
              label="Log out"
              divider={false}
            />
          </SettingsGroup>
        </Gutter>

        <Gutter>
          <Pressable accessibilityRole="button">
            <Card tone="goldSoft" style={styles.support}>
              <HeadsetIcon size={26} color={colors.text} />
              <View style={styles.supportCopy}>
                <Text variant="strong">24/7 Support</Text>
                <Text variant="caption" color={colors.textMuted}>
                  Our team is always here to help.
                </Text>
              </View>
              <ChevronRightIcon size={22} color={colors.text} />
            </Card>
          </Pressable>
        </Gutter>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 10,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: 14,
  },
  masthead: {
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  mastheadTitle: {
    fontSize: 24,
  },

  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 20,
  },
  profileIdentity: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileNameText: {
    fontSize: 20,
  },

  support: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
  },
  supportCopy: {
    flex: 1,
    gap: 3,
  },
})
