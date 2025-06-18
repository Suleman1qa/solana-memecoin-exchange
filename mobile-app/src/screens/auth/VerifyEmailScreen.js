import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, resendVerificationEmail } from '../../store/slices/authSlice.js';
import { theme } from '../../theme.js';

const VerifyEmailScreen = ({ route, navigation }) => {
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [autoVerifying, setAutoVerifying] = useState(true);

  const { token, email } = route.params || {};
  const dispatch = useDispatch();
  const { isLoading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      handleVerifyEmail();
    } else {
      setAutoVerifying(false);
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
      setAutoVerifying(false);
    }
  }, [error]);

  const handleVerifyEmail = async () => {
    if (!token) {
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(verifyEmail(token)).unwrap();
      setVerificationSuccess(true);
      setAutoVerifying(false);
    } catch (error) {
      setSnackbarVisible(true);
      setAutoVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = email || user?.email;
    
    if (!emailToUse) {
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(resendVerificationEmail(emailToUse)).unwrap();
      // Show success message
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarVisible(true);
    }
  };

  const dismissSnackbar = () => {
    setSnackbarVisible(false);
    dispatch(clearError());
  };

  const handleContinue = () => {
    if (verificationSuccess) {
      navigation.navigate('TabNavigator');
    } else {
      navigation.navigate('Login');
    }
  };

  if (autoVerifying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Verifying your email...</Text>
      </View>
    );
  }

  if (verificationSuccess) {
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
            
            <Text style={styles.successTitle}>Email Verified!</Text>
            <Text style={styles.successMessage}>
              Your email has been successfully verified. You can now access all features of the app.
            </Text>

            <Button
              mode="contained"
              onPress={handleContinue}
              style={styles.button}
              labelStyle={styles.buttonLabel}
            >
              Continue to App
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
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>
          
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            {token 
              ? "There was an issue verifying your email. Please try again or request a new verification link."
              : "Please check your email and click the verification link to activate your account."
            }
          </Text>

          {email && (
            <Text style={styles.emailText}>
              Verification email sent to: <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
          )}

          <View style={styles.buttonContainer}>
            {token && (
              <Button
                mode="contained"
                onPress={handleVerifyEmail}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.colors.text} size="small" />
                ) : (
                  'Try Again'
                )}
              </Button>
            )}

            <Button
              mode="outlined"
              onPress={handleResendVerification}
              style={styles.resendButton}
              labelStyle={styles.resendButtonLabel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.colors.primary} size="small" />
              ) : (
                'Resend verification email'
              )}
            </Button>

            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              style={styles.backButton}
              textColor={theme.colors.primary}
            >
              Back to Login
            </Button>
          </View>

          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Didn't receive the email? Check your spam folder or contact support if you continue to have issues.
            </Text>
          </View>
        </View>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={dismissSnackbar}
          action={{
            label: 'Dismiss',
            onPress: dismissSnackbar,
          }}
          duration={4000}
          style={[
            styles.snackbar,
            verificationSuccess ? styles.successSnackbar : styles.errorSnackbar
          ]}
        >
          {verificationSuccess 
            ? 'Verification email sent successfully!'
            : error || 'Failed to verify email. Please try again.'
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emailText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  emailHighlight: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    padding: 5,
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
    minWidth: 200,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    borderColor: theme.colors.primary,
    marginBottom: 16,
    minWidth: 200,
  },
  resendButtonLabel: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  backButton: {
    marginTop: 8,
  },
  helpContainer: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
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
    marginBottom: 20,
  },
  successSnackbar: {
    backgroundColor: theme.colors.positive,
  },
  errorSnackbar: {
    backgroundColor: theme.colors.error,
  },
});

export default VerifyEmailScreen;
