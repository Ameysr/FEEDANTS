import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme';
import { describeApiError } from '@/utils/errors';

const DEMO_EMAIL = 'demo@feedants.com';
const DEMO_PASSWORD = 'Password123';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const closeAfterAuth = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim().toLowerCase(), password);
      closeAfterAuth();
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const useDemoAccount = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={closeAfterAuth}
            style={styles.close}
            hitSlop={8}
          >
            <Text style={styles.closeLabel}>Close</Text>
          </Pressable>

          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to join competitions and track your registrations.</Text>

          {error ? <ErrorState variant="inline" message={error} style={styles.error} /> : null}

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              onSubmitEditing={() => void handleSubmit()}
              returnKeyType="go"
            />
          </View>

          <Button label="Sign in" onPress={() => void handleSubmit()} loading={submitting} size="lg" fullWidth />

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to Feedants?</Text>
            <Pressable onPress={() => router.replace('/register')} hitSlop={6}>
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={useDemoAccount}
            style={({ pressed }) => [styles.demo, pressed && styles.demoPressed]}
          >
            <Text style={styles.demoTitle}>Use demo account</Text>
            <Text style={styles.demoText}>
              {DEMO_EMAIL} / {DEMO_PASSWORD}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.md },
  close: { alignSelf: 'flex-end', paddingVertical: spacing.xs },
  closeLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.semibold },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.heavy,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: fontSize.md * 1.5,
    marginBottom: spacing.md,
  },
  error: { marginBottom: spacing.sm },
  form: { gap: spacing.lg, marginBottom: spacing.md },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerText: { fontSize: fontSize.md, color: colors.textSecondary },
  footerLink: { fontSize: fontSize.md, color: colors.primary, fontWeight: fontWeight.bold },
  demo: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
    alignItems: 'center',
    gap: 2,
  },
  demoPressed: { opacity: 0.7 },
  demoTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  demoText: { fontSize: fontSize.xs, color: colors.textSecondary },
});
