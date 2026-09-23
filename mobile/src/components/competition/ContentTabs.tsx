import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import type { CompetitionDetail } from '../../api/types';
import { colors, fontSize, fontWeight, radius, spacing } from '../../theme';
import { Card } from '../ui/Card';

type TabKey = 'about' | 'judging' | 'rules';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

interface ContentTabsProps {
  competition: CompetitionDetail;
  style?: ViewStyle;
}

/** Tabbed long-form content with an expandable body. */
export function ContentTabs({ competition, style }: ContentTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('about');
  const [expanded, setExpanded] = useState(false);

  const content = getTabContent(competition, activeTab);
  const canCollapse = content.kind === 'text' ? content.value.length > 220 : content.items.length > 3;

  return (
    <View style={style}>
      <Card padded={false}>
        <View style={styles.tabBar} accessibilityRole="tablist">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Pressable
                key={tab.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                onPress={() => {
                  setActiveTab(tab.key);
                  setExpanded(false);
                }}
                style={styles.tab}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={2}>
                  {tab.label}
                </Text>
                <View style={[styles.underline, isActive && styles.underlineActive]} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.body}>
          {content.kind === 'text' ? (
            <Text style={styles.paragraph} numberOfLines={expanded ? undefined : 4}>
              {content.value}
            </Text>
          ) : (
            <View style={styles.list}>
              {(expanded ? content.items : content.items.slice(0, 3)).map((item) => (
                <View key={item} style={styles.listRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {canCollapse ? (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setExpanded((value) => !value)}
              style={styles.viewMore}
              hitSlop={6}
            >
              <Text style={styles.viewMoreLabel}>{expanded ? 'View less' : 'View more'}</Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.primary}
              />
            </Pressable>
          ) : null}
        </View>
      </Card>
    </View>
  );
}

type TabContent = { kind: 'text'; value: string } | { kind: 'list'; items: string[] };

function getTabContent(competition: CompetitionDetail, tab: TabKey): TabContent {
  switch (tab) {
    case 'about':
      return { kind: 'text', value: competition.aboutText ?? competition.description };
    case 'judging':
      return { kind: 'list', items: competition.judgingParameters };
    case 'rules':
      return { kind: 'list', items: competition.rulesAndEligibility };
  }
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: { flex: 1, paddingTop: spacing.lg, paddingHorizontal: spacing.sm, alignItems: 'center' },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    minHeight: 32,
  },
  tabLabelActive: { color: colors.primary, fontWeight: fontWeight.bold },
  underline: {
    height: 2.5,
    width: '100%',
    borderRadius: radius.pill,
    marginTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  underlineActive: { backgroundColor: colors.primary },
  body: { padding: spacing.lg },
  paragraph: {
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.6,
    color: colors.textSecondary,
  },
  list: { gap: spacing.md },
  listRow: { flexDirection: 'row', gap: spacing.sm },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: fontSize.md,
    lineHeight: fontSize.md * 1.5,
    color: colors.textSecondary,
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  viewMoreLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
});
