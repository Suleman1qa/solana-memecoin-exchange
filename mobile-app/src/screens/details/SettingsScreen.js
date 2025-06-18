import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text, Card, Title, Switch, Divider, List, Button, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { logout, changePassword } from '../../store/slices/authSlice.js';
import { updateCurrentUser } from '../../store/slices/userSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [autoLockEnabled, setAutoLockEnabled] = useState(false);
  
  // Dialog states
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // Snackbar
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);

  useEffect(() => {
    loadSettings();
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setNotificationsEnabled(parsedSettings.notificationsEnabled ?? true);
        setBiometricEnabled(parsedSettings.biometricEnabled ?? false);
        setPriceAlertsEnabled(parsedSettings.priceAlertsEnabled ?? true);
        setDarkModeEnabled(parsedSettings.darkModeEnabled ?? true);
        setAutoLockEnabled(parsedSettings.autoLockEnabled ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      const currentSettings = {
        notificationsEnabled,
        biometricEnabled,
        priceAlertsEnabled,
        darkModeEnabled,
        autoLockEnabled,
        ...newSettings
      };
      
      await AsyncStorage.setItem('userSettings', JSON.stringify(currentSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    saveSettings({ notificationsEnabled: value });
  };

  const handleBiometricToggle = (value) => {
    setBiometricEnabled(value);
    saveSettings({ biometricEnabled: value });
    
    if (value) {
      // In a real app, you would implement biometric authentication setup here
      setSnackbarMessage('Biometric authentication enabled');
      setSnackbarVisible(true);
    }
  };

  const handlePriceAlertsToggle = (value) => {
    setPriceAlertsEnabled(value);
    saveSettings({ priceAlertsEnabled: value });
  };

  const handleDarkModeToggle = (value) => {
    setDarkModeEnabled(value);
    saveSettings({ darkModeEnabled: value });
    // In a real app, you would implement theme switching here
  };

  const handleAutoLockToggle = (value) => {
    setAutoLockEnabled(value);
    saveSettings({ autoLockEnabled: value });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbarMessage('Please fill in all password fields');
      setSnackbarVisible(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbarMessage('New passwords do not match');
      setSnackbarVisible(true);
      return;
    }

    if (newPassword.length < 8) {
      setSnackbarMessage('Password must be at least 8 characters long');
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(changePassword({ currentPassword, newPassword }));
      setChangePasswordVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSnackbarMessage('Password changed successfully');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to change password');
      setSnackbarVisible(true);
    }
  };

  const handleUpdateProfile = async () => {
    if (!fullName.trim() || !email.trim()) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarVisible(true);
      return;
    }

    try {
      await dispatch(updateCurrentUser({ fullName, email }));
      setEditProfileVisible(false);
      setSnackbarMessage('Profile updated successfully');
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage('Failed to update profile');
      setSnackbarVisible(true);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would implement account deletion here
            setSnackbarMessage('Account deletion requested. Contact support to complete.');
            setSnackbarVisible(true);
            setDeleteAccountVisible(false);
          }
        }
      ]
    );
  };

  const openExternalLink = (url) => {
    Linking.openURL(url);
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          icon: 'account-edit',
          onPress: () => setEditProfileVisible(true)
        },
        {
          title: 'Change Password',
          subtitle: 'Update your account password',
          icon: 'lock-reset',
          onPress: () => setChangePasswordVisible(true)
        },
        {
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          icon: 'shield-key',
          onPress: () => {
            setSnackbarMessage('2FA setup coming soon');
            setSnackbarVisible(true);
          }
        }
      ]
    },
    {
      title: 'Security',
      items: [
        {
          title: 'Biometric Authentication',
          subtitle: 'Use fingerprint or face ID',
          icon: 'fingerprint',
          isSwitch: true,
          value: biometricEnabled,
          onToggle: handleBiometricToggle
        },
        {
          title: 'Auto Lock',
          subtitle: 'Lock app when inactive',
          icon: 'lock-clock',
          isSwitch: true,
          value: autoLockEnabled,
          onToggle: handleAutoLockToggle
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          title: 'Push Notifications',
          subtitle: 'Receive app notifications',
          icon: 'bell',
          isSwitch: true,
          value: notificationsEnabled,
          onToggle: handleNotificationToggle
        },
        {
          title: 'Price Alerts',
          subtitle: 'Get notified of price changes',
          icon: 'bell-alert',
          isSwitch: true,
          value: priceAlertsEnabled,
          onToggle: handlePriceAlertsToggle
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          icon: 'theme-light-dark',
          isSwitch: true,
          value: darkModeEnabled,
          onToggle: handleDarkModeToggle
        }
      ]
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help Center',
          subtitle: 'Get help and support',
          icon: 'help-circle',
          onPress: () => navigation.navigate('Help')
        },
        {
          title: 'Contact Support',
          subtitle: 'Get in touch with our team',
          icon: 'message-text',
          onPress: () => openExternalLink('mailto:support@solanamemecoin.exchange')
        },
        {
          title: 'Privacy Policy',
          subtitle: 'Read our privacy policy',
          icon: 'shield-account',
          onPress: () => openExternalLink('https://solanamemecoin.exchange/privacy')
        },
        {
          title: 'Terms of Service',
          subtitle: 'Read our terms of service',
          icon: 'file-document',
          onPress: () => openExternalLink('https://solanamemecoin.exchange/terms')
        }
      ]
    }
  ];

  const renderSettingItem = (item) => {
    if (item.isSwitch) {
      return (
        <List.Item
          key={item.title}
          title={item.title}
          description={item.subtitle}
          left={props => <List.Icon {...props} icon={item.icon} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              color={theme.colors.primary}
            />
          )}
          titleStyle={styles.listItemTitle}
          descriptionStyle={styles.listItemDescription}
          style={styles.listItem}
        />
      );
    }

    return (
      <List.Item
        key={item.title}
        title={item.title}
        description={item.subtitle}
        left={props => <List.Icon {...props} icon={item.icon} color={theme.colors.primary} />}
        right={props => <List.Icon {...props} icon="chevron-right" color="#888" />}
        onPress={item.onPress}
        titleStyle={styles.listItemTitle}
        descriptionStyle={styles.listItemDescription}
        style={styles.listItem}
      />
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="account-circle" size={60} color={theme.colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Title style={styles.profileName}>{user?.fullName || user?.username || 'User'}</Title>
              <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
              <Text style={styles.profileJoined}>
                Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {settingsSections.map((section, sectionIndex) => (
        <Card key={section.title} style={styles.sectionCard}>
          <Card.Content style={styles.sectionContent}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            
            {section.items.map((item, itemIndex) => (
              <View key={item.title}>
                {renderSettingItem(item)}
                {itemIndex < section.items.length - 1 && <Divider style={styles.itemDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.dangerCard}>
        <Card.Content>
          <Text style={styles.dangerSectionTitle}>Danger Zone</Text>
          
          <TouchableOpacity style={styles.dangerButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color={theme.colors.error} />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dangerButton, styles.deleteButton]} 
            onPress={() => setDeleteAccountVisible(true)}
          >
            <MaterialCommunityIcons name="delete" size={20} color={theme.colors.error} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2024 Solana Memecoin Exchange</Text>
      </View>

      {/* Change Password Dialog */}
      <Portal>
        <Dialog 
          visible={changePasswordVisible} 
          onDismiss={() => setChangePasswordVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setChangePasswordVisible(false)}>Cancel</Button>
            <Button onPress={handleChangePassword} loading={isLoading}>Change</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Profile Dialog */}
      <Portal>
        <Dialog 
          visible={editProfileVisible} 
          onDismiss={() => setEditProfileVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditProfileVisible(false)}>Cancel</Button>
            <Button onPress={handleUpdateProfile} loading={isLoading}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Delete Account Dialog */}
      <Portal>
        <Dialog 
          visible={deleteAccountVisible} 
          onDismiss={() => setDeleteAccountVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={[styles.dialogTitle, { color: theme.colors.error }]}>
            Delete Account
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.deleteWarning}>
              This action cannot be undone. All your data including wallets, transactions, and settings will be permanently deleted.
            </Text>
            <Text style={styles.deleteWarning}>
              Please make sure to withdraw all your funds before proceeding.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteAccountVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleDeleteAccount} 
              textColor={theme.colors.error}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  profileCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  profileJoined: {
    fontSize: 12,
    color: '#666',
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  sectionContent: {
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  listItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  listItemTitle: {
    color: theme.colors.text,
    fontSize: 16,
  },
  listItemDescription: {
    color: '#888',
    fontSize: 14,
  },
  itemDivider: {
    backgroundColor: theme.colors.border,
    marginLeft: 56,
  },
  dangerCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderColor: theme.colors.error + '30',
    borderWidth: 1,
  },
  dangerSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: 16,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.error + '10',
    marginBottom: 8,
  },
  deleteButton: {
    marginBottom: 0,
  },
  dangerButtonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.error,
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 10,
    color: '#666',
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogInput: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  deleteWarning: {
    color: theme.colors.error,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
});

export default SettingsScreen;
