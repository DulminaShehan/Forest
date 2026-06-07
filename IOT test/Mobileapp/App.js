import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Provider as PaperProvider, DarkTheme } from 'react-native-paper';
import AppNavigator from './src/navigation/AppNavigator';
import { initAuthListener, loadStoredRole } from './src/utils/firebase';

export const AuthContext = React.createContext({
  user: null,
  role: null,
  setRole: () => {},
});

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuthListener(async authUser => {
      setUser(authUser);
      if (authUser) {
        const stored = await loadStoredRole();
        setRole(stored);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authContextValue = useMemo(
    () => ({
      user,
      role,
      setRole,
    }),
    [user, role]
  );

  if (loading) {
    return (
      <PaperProvider theme={DarkTheme}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={DarkTheme}>
      <AuthContext.Provider value={authContextValue}>
        <AppNavigator />
      </AuthContext.Provider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
});
