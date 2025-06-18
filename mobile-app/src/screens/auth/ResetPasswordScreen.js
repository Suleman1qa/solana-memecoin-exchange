import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearError } from '../../store/slices/authSlice.js';
import { theme } from '../../theme.js';

const ResetPasswordScreen = ({ route, navigation }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const { token } = route.params || {};
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
      navigation.navigate('Login');
    }
  }, [token, navigation]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const validatePassword = () => {
    if (!password || !confirmPassword) {
      setValidationError('All fields are required');
      return false;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setValidationError('Password must contain uppercase, lowercase, number, and special character');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    setValidationError('');
    
    if (!validatePassword()) {
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      setResetSuccess(true);
    } catch (error) {
      setSnackbarVisible(true);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const toggleConfirmSecureEntry = () => {
    setConfirmSecureTextEntry(!confirmSecureTextEntry);
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    setValidationError('');
    dispatch(clearError());
  };

  const handleLoginRedirect = () => {
    navigation.navigate('Login');
  };

  if (resetSuccess) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            
            <Text style={styles.successTitle}>Password Reset Successful!</Text>
            <Text style={styles.successMessage}>
              Your password has been successfully reset. You can now log in with your new password.
            </Text>

            <Button
              mode="contained"
              onPress={handleLoginRedirect}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Go to Login
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔐</Text>
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your new password below. Make sure it's strong and secure.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="New Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={secureTextEntry}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            right={
              <TextInput.Icon
                name={secureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleSecureEntry}
                color={theme.colors.primary}
              />
            }
          />

          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={confirmSecureTextEntry}
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            right={
              <TextInput.Icon
                name={confirmSecureTextEntry ? 'eye' : 'eye-off'}
                onPress={toggleConfirmSecureEntry}
                color={theme.colors.primary}
              />
            }
          />

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirement,
                password.length >= 8 ? styles.requirementMet : styles.requirementNotMet
              ]}>
                • At least 8 characters long
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirement,
                /[A-Z]/.test(password) && /[a-z]/.test(password) ? styles.requirementMet : styles.requirementNotMet
              ]}>
                • Contains uppercase and lowercase letters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirement,
                /\d/.test(password) ? styles.requirementMet : styles.requirementNotMet
              ]}>
                • Contains at least one number
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text style={[
                styles.requirement,
                /[!@#$%^&*(),.?":{}|<>]/.test(password) ? styles.requirementMet : styles.requirementNotMet
              ]}>
                • Contains at least one special character
              </Text>
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            disabled={isLoading || !password.trim() || !confirmPassword.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              'Reset Password'
            )}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.backToLoginButton}
            textColor={theme.colors.primary}
          >
            Back to Login
          </Button>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: 'Dismiss',
            onPress: dismissSnackbar,
          }}
          duration={4000}
          style={styles.snackbar}
        >
          {error || validationError}
        </Snackbar>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  passwordRequirements: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  requirementItem: {
    marginBottom: 4,
  },
  requirement: {
    fontSize: 12,
    lineHeight: 16,
  },
  requirementMet: {
    color: theme.colors.positive,
  },
  requirementNotMet: {
    color: '#888',
  },
  button: {
    padding: 5,
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backToLoginButton: {
    alignSelf: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.positive + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  successIcon: {
    fontSize: 48,
    color: theme.colors.positive,
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  snackbar: {
    backgroundColor: theme.colors.error,
  },
});

export default ResetPasswordScreen;
