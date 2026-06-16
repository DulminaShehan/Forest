import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Snackbar } from 'react-native-paper';
import { AuthContext } from '../../App';
import { loginWithEmail, registerWithEmail, loginAnonymously, saveUserRole } from '../utils/firebase';
import { C, R, S } from '../theme';

const ROLES = [
  { value: 'OFFICER', label: 'Government Officer', icon: 'shield-account', sub: 'Full data access & export' },
  { value: 'HIKER',   label: 'Hiker',              icon: 'hiking',         sub: 'Safety view & SOS'        },
];

export default function LoginScreen() {
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [role, setRole]               = useState('HIKER');
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [snackMsg, setSnackMsg]       = useState('');
  const [snackVisible, setSnackVisible] = useState(false);
  const authContext = useContext(AuthContext);

  const showError = msg => { setSnackMsg(msg); setSnackVisible(true); };

  const saveRole = async user => {
    await saveUserRole(user.uid, role);
    authContext.setRole(role);
  };

  const handleLogin = async () => {
    if (!email || !password) { showError('Enter your email and password.'); return; }
    setLoading(true);
    try {
      const r = await loginWithEmail(email.trim(), password);
      await saveRole(r.user);
    } catch (e) { showError(e.message || 'Login failed.'); }
    finally { setLoading(false); }
  };

  const handleSignUp = async () => {
    if (!email || !password) { showError('Enter email and password to register.'); return; }
    setLoading(true);
    try {
      const r = await registerWithEmail(email.trim(), password);
      await saveRole(r.user);
    } catch (e) { showError(e.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      const r = await loginAnonymously();
      await saveRole(r.user);
    } catch (e) { showError(e.message || 'Anonymous sign-in failed.'); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.bgDeep} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Branding ─────────────────────────────── */}
        <View style={styles.brandArea}>
          <View style={styles.logoRing}>
            <MaterialCommunityIcons name="tree" size={44} color={C.primary} />
          </View>
          <Text style={styles.appName}>Forest IoT</Text>
          <Text style={styles.appSub}>Real-time forest monitoring system</Text>
        </View>

        {/* ── Role selector ────────────────────────── */}
        <Text style={styles.sectionLabel}>Select your role</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => {
            const active = role === r.value;
            return (
              <TouchableOpacity
                key={r.value}
                style={[styles.roleCard, active && styles.roleCardActive]}
                onPress={() => setRole(r.value)}
                activeOpacity={0.8}
              >
                <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                  <MaterialCommunityIcons
                    name={r.icon}
                    size={26}
                    color={active ? C.primary : C.textMuted}
                  />
                </View>
                <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                  {r.label}
                </Text>
                <Text style={styles.roleSub}>{r.sub}</Text>
                {active && (
                  <View style={styles.roleCheckBadge}>
                    <MaterialCommunityIcons name="check-circle" size={14} color={C.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Divider ──────────────────────────────── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Sign in with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Email input ──────────────────────────── */}
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="email-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor={C.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* ── Password input ───────────────────────── */}
        <View style={styles.inputRow}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={C.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={C.textMuted}
            secureTextEntry={!showPass}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
            <MaterialCommunityIcons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={C.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* ── Primary button ───────────────────────── */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color={C.bgDeep} size="small" />
            : <Text style={styles.btnPrimaryText}>Sign In</Text>
          }
        </TouchableOpacity>

        {/* ── Outlined button ──────────────────────── */}
        <TouchableOpacity
          style={[styles.btnOutlined, loading && styles.btnDisabled]}
          onPress={handleSignUp}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnOutlinedText}>Create Account</Text>
        </TouchableOpacity>

        {/* ── Guest link ───────────────────────────── */}
        <TouchableOpacity onPress={handleAnonymous} disabled={loading} style={styles.guestBtn}>
          <MaterialCommunityIcons name="account-outline" size={15} color={C.textMuted} />
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
      </ScrollView>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3500}
        style={styles.snack}
      >
        {snackMsg}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bgDeep,
  },
  scroll: {
    padding: S.lg,
    paddingTop: 56,
    paddingBottom: S.xl,
  },

  /* Branding */
  brandArea: {
    alignItems: 'center',
    marginBottom: S.xl,
  },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.md,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    color: C.text,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  appSub: {
    fontSize: 13,
    color: C.textSub,
    opacity: 0.7,
  },

  /* Role selector */
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: S.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: S.sm,
    marginBottom: S.lg,
  },
  roleCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: R.lg,
    padding: S.md,
    alignItems: 'center',
    position: 'relative',
  },
  roleCardActive: {
    borderColor: C.primary,
    backgroundColor: '#0D2218',
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  roleIconWrapActive: {
    backgroundColor: '#0F2E1C',
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  roleLabelActive: {
    color: C.text,
  },
  roleSub: {
    fontSize: 10,
    color: C.textMuted,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 14,
  },
  roleCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  /* Divider */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: S.lg,
    gap: S.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 11,
    color: C.textMuted,
    paddingHorizontal: 4,
  },

  /* Inputs */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    marginBottom: S.sm + 2,
  },
  inputIcon: {
    marginRight: S.sm,
  },
  input: {
    flex: 1,
    height: 52,
    color: C.text,
    fontSize: 15,
  },
  eyeBtn: {
    padding: S.xs,
  },

  /* Buttons */
  btnPrimary: {
    backgroundColor: C.primaryBtn,
    borderRadius: R.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: S.sm,
    marginBottom: S.sm,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPrimaryText: {
    color: C.bgDeep,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnOutlined: {
    borderWidth: 1.5,
    borderColor: C.primaryDark,
    borderRadius: R.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: S.sm,
  },
  btnOutlinedText: {
    color: C.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: S.md,
    marginTop: S.xs,
  },
  guestText: {
    color: C.textMuted,
    fontSize: 13,
  },
  snack: {
    backgroundColor: C.surfaceHigh,
  },
});
