import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme';

const IS_WEB = Platform.OS === 'web';

/** iPhone-ish logical viewport so the mobile layout reads correctly on desktop. */
const DEVICE_WIDTH = 412;
const DEVICE_MAX_HEIGHT = 892;
const BEZEL = 8;
/** Corner radii — deliberately small and squarish. Set both to 0 for a hard rectangle. */
const DEVICE_RADIUS = 12;
const SCREEN_RADIUS = 6;

function clockText(date: Date): string {
  return date
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(/\u202f/g, ' ');
}

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * On web, renders the app inside a centred phone shell so the mobile layout is
 * never stretched across the browser. On native this is a pass-through — the
 * device already *is* the phone.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!IS_WEB) return undefined;
    const id = setInterval(() => setNow(new Date()), 20_000);
    return () => clearInterval(id);
  }, []);

  if (!IS_WEB) return <>{children}</>;

  return (
    <View style={styles.backdrop}>
      <View style={styles.device}>
        <View style={styles.screen}>
          <View style={styles.statusBar}>
            <Text style={styles.clock}>{clockText(now)}</Text>
            <View style={styles.statusIcons}>
              <Ionicons name="cellular" size={13} color={colors.textPrimary} />
              <Ionicons name="wifi" size={14} color={colors.textPrimary} />
              <Ionicons name="battery-full" size={16} color={colors.textPrimary} />
            </View>
          </View>

          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#08211F',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  device: {
    width: DEVICE_WIDTH,
    maxWidth: '100%',
    height: '100%',
    maxHeight: DEVICE_MAX_HEIGHT,
    borderRadius: DEVICE_RADIUS,
    backgroundColor: '#0F1B2D',
    padding: BEZEL,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 56,
    elevation: 24,
  },
  screen: {
    flex: 1,
    borderRadius: SCREEN_RADIUS,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  clock: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  content: { flex: 1 },
});
