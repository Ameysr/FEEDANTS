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
import { colors, fontSize, fontWeight, spacing } from '@/theme';
import { describeApiError } from '@/utils/errors';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError('Enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            style={styles.back}
            hitSlop={8}
          >
            <Text style={styles.backLabel}>Go back</Text>
          </Pressable>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join competitions, track registrations and submit your entries.</Text>

          {error ? <ErrorState variant="inline" message={error} style={styles.error} /> : null}

          <View style={styles.form}>
            <TextField
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Aditi Sharma"
              autoComplete="name"
              textContentType="name"
            />
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
              placeholder="At least 8 characters"
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              onSubmitEditing={() => void handleSubmit()}
              returnKeyType="go"
            />
          </View>

          <Button
            label="Create account"
            onPress={() => void handleSubmit()}
            loading={submitting}
            size="lg"
            fullWidth
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered?</Text>
            <Pressable onPress={() => router.replace('/login')} hitSlop={6}>
              <Text style={styles.footerLink}>Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.md },
  back: { alignSelf: 'flex-start', paddingVertical: spacing.xs },
  backLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.semibold },
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
});
