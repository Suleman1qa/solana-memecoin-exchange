import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearError } from '../../store/slices/authSlice.js';
import { theme } from '../../theme.js';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
    }
  }, [error]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    setValidationError('');
    
    if (!email.trim()) {
      setValidationError('Email address is required');
      setSnackbarVisible(true);
      return;
    }

    if (!validateEmail(email)) {
      setValidationError('Please enter a valid email address');
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(forgotPassword(email)).unwrap();
      setEmailSent(true);
    } catch (error) {
      setSnackbarVisible(true);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleForgotPassword();
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    setValidationError('');
    dispatch(clearError());
  };

  if (emailSent) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.successContainer}>
            <View style={styles.emailIconContainer}>
              <Text style={styles.emailIcon}>📧</Text>
            </View>
            
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successMessage}>
              We've sent a password reset link to{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.instructionText}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </Text>

            <Button
              mode="contained"
              onPress={handleResendEmail}
              style={styles.resendButton}
              labelStyle={styles.buttonLabel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.text} size="small" />
              ) : (
                'Resend email'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              textColor={theme.colors.primary}
            >
              Back to login
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
            <Text style={styles.icon}>🔑</Text>
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Don't worry! Enter your email address and we'll send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            error={validationError && !validateEmail(email)}
          />

          <Button
            mode="contained"
            onPress={handleForgotPassword}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            disabled={isLoading || !email.trim()}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.colors.text} size="small" />
            ) : (
              'Send reset link'
            )}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.backToLoginButton}
            textColor={theme.colors.primary}
          >
            Back to login
          </Button>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: 'Dismiss',
            onPress: dismissSnackbar,
          }}
          duration={3000}
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
  emailIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  emailIcon: {
    fontSize: 48,
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
    marginBottom: 20,
    lineHeight: 24,
  },
  emailText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  resendButton: {
    padding: 5,
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
    minWidth: 200,
  },
  backButton: {
    alignSelf: 'center',
  },
  snackbar: {
    backgroundColor: theme.colors.error,
  },
});

export default ForgotPasswordScreen;
