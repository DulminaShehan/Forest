import React, { useContext, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Button,
  TextInput,
  Title,
  Text,
  RadioButton,
  Card,
  Paragraph,
  Snackbar,
} from 'react-native-paper';
import { AuthContext } from '../../App';
import {
  loginWithEmail,
  registerWithEmail,
  loginAnonymously,
  saveUserRole,
} from '../utils/firebase';

const ROLES = [
  { value: 'OFFICER', label: 'Government Officer' },
  { value: 'HIKER', label: 'Hiker' },
];

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('HIKER');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const authContext = useContext(AuthContext);

  const showError = text => {
    setMessage(text);
    setVisible(true);
  };

  const handleUserRoleSaved = async user => {
    if (!role) {
      showError('Please select a role before continuing.');
      return;
    }
    await saveUserRole(user.uid, role);
    authContext.setRole(role);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showError('Enter email and password.');
      return;
    }
    if (!role) {
      showError('Select a role.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginWithEmail(email.trim(), password);
      await handleUserRoleSaved(result.user);
    } catch (error) {
      showError(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      showError('Enter email and password to register.');
      return;
    }
    if (!role) {
      showError('Select a role.');
      return;
    }
    setLoading(true);
    try {
      const result = await registerWithEmail(email.trim(), password);
      await handleUserRoleSaved(result.user);
    } catch (error) {
      showError(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    if (!role) {
      showError('Select a role for anonymous access.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginAnonymously();
      await handleUserRoleSaved(result.user);
    } catch (error) {
      showError(error.message || 'Anonymous sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Forest IoT Access</Title>
          <Paragraph style={styles.subtitle}>
            Sign in using Firebase Authentication and choose your role.
          </Paragraph>
          <TextInput
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            mode="outlined"
          />
          <Text style={styles.sectionTitle}>Choose role</Text>
          <RadioButton.Group onValueChange={newValue => setRole(newValue)} value={role}>
            {ROLES.map(option => (
              <RadioButton.Item
                key={option.value}
                label={option.label}
                value={option.value}
                mode="android"
                labelStyle={styles.radioLabel}
              />
            ))}
          </RadioButton.Group>
          <Button
            mode="contained"
            loading={loading}
            onPress={handleLogin}
            style={styles.button}
          >
            Sign In
          </Button>
          <Button
            mode="outlined"
            loading={loading}
            onPress={handleSignUp}
            style={styles.button}
          >
            Create Account
          </Button>
          <Button
            mode="text"
            loading={loading}
            onPress={handleAnonymous}
            style={styles.button}
          >
            Continue Anonymously
          </Button>
        </Card.Content>
      </Card>
      <Snackbar visible={visible} onDismiss={() => setVisible(false)}>
        {message}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    padding: 8,
    backgroundColor: '#1e1e1e',
  },
  title: {
    marginBottom: 8,
    color: '#ffffff',
  },
  subtitle: {
    marginBottom: 16,
    color: '#c7c7c7',
  },
  input: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: '#ffffff',
    fontWeight: '700',
  },
  radioLabel: {
    color: '#ffffff',
  },
  button: {
    marginTop: 10,
  },
});
