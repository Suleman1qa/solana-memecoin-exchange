import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Title, Divider, List, Button, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [contactDialogVisible, setContactDialogVisible] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { user } = useSelector(state => state.auth);

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'rocket-launch',
      items: [
        {
          question: 'How do I create my first wallet?',
          answer: 'To create a wallet, go to the Wallet tab and tap the "+" button. You can create multiple wallets for different purposes like trading and storing funds.'
        },
        {
          question: 'How do I deposit funds?',
          answer: 'Navigate to your wallet, tap "Deposit", select the token you want to deposit, and send funds to the displayed address. Always double-check the address before sending.'
        },
        {
          question: 'What are memecoins?',
          answer: 'Memecoins are cryptocurrency tokens that are often created as jokes or memes but can gain real value through community adoption. They are typically highly volatile and speculative investments.'
        }
      ]
    },
    {
      id: 'trading',
      title: 'Trading',
      icon: 'chart-line',
      items: [
        {
          question: 'How do I buy a memecoin?',
          answer: 'Find the token you want to buy in the Market tab, tap on it to view details, then tap "Trade". You can place market orders for immediate execution or limit orders at specific prices.'
        },
        {
          question: 'What is the difference between market and limit orders?',
          answer: 'Market orders execute immediately at the current market price. Limit orders only execute when the price reaches your specified level, giving you more control but no guarantee of execution.'
        },
        {
          question: 'How do trading fees work?',
          answer: 'We charge a small fee on each trade (typically 0.1-0.25%). Fees are automatically deducted from your trade amount and help maintain the platform.'
        },
        {
          question: 'What is slippage?',
          answer: 'Slippage occurs when the execution price differs from the expected price due to market movement. You can set slippage tolerance in swap transactions to control this.'
        }
      ]
    },
    {
      id: 'security',
      title: 'Security & Safety',
      icon: 'shield-check',
      items: [
        {
          question: 'How are my funds protected?',
          answer: 'Your wallet private keys are encrypted and stored securely on your device. We use industry-standard security practices and never store your private keys on our servers.'
        },
        {
          question: 'What should I do if I suspect unauthorized access?',
          answer: 'Immediately change your password, enable 2FA if not already active, and contact our support team. Consider moving funds to a new wallet if you believe your account is compromised.'
        },
        {
          question: 'How can I protect myself from scams?',
          answer: 'Never share your private keys or seed phrases. Be wary of tokens with unrealistic promises. Always verify token contracts and be cautious of sudden price pumps.'
        }
      ]
    },
    {
      id: 'wallet-management',
      title: 'Wallet Management',
      icon: 'wallet',
      items: [
        {
          question: 'Can I import an existing wallet?',
          answer: 'Currently, the app creates new wallets for you. We\'re working on wallet import functionality for future releases.'
        },
        {
          question: 'How do I backup my wallet?',
          answer: 'Your wallet is automatically backed up with your account. However, we recommend noting down your wallet addresses for your records.'
        },
        {
          question: 'What happens if I lose my phone?',
          answer: 'Your wallets are tied to your account. Simply log in on a new device to access your funds. Always keep your login credentials secure.'
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: 'wrench',
      items: [
        {
          question: 'My transaction is stuck/pending',
          answer: 'Solana transactions usually confirm within seconds. If a transaction is pending for more than a few minutes, it may have failed. Check your transaction history or contact support.'
        },
        {
          question: 'I can\'t see my balance after depositing',
          answer: 'Deposits typically appear within 1-2 minutes. If you don\'t see your funds after 10 minutes, check the transaction on Solana Explorer using the transaction hash.'
        },
        {
          question: 'The app is running slowly',
          answer: 'Try closing and reopening the app. If problems persist, check your internet connection or try again later during less busy periods.'
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const openExternalLink = (url) => {
    Linking.openURL(url);
  };

  const submitSupportRequest = () => {
    if (!supportMessage.trim()) {
      setSnackbarMessage('Please enter your message');
      setSnackbarVisible(true);
      return;
    }

    // In a real app, you would send this to your support system
    console.log('Support request:', {
      userId: user?._id,
      message: supportMessage,
      timestamp: new Date().toISOString()
    });

    setSnackbarMessage('Support request submitted successfully');
    setSnackbarVisible(true);
    setContactDialogVisible(false);
    setSupportMessage('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <MaterialCommunityIcons name="help-circle" size={40} color={theme.colors.primary} />
            <View style={styles.welcomeText}>
              <Title style={styles.welcomeTitle}>How can we help you?</Title>
              <Text style={styles.welcomeSubtitle}>
                Find answers to common questions or contact our support team
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => setContactDialogVisible(true)}
            >
              <MaterialCommunityIcons name="message-text" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Contact Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => openExternalLink('https://explorer.solana.com')}
            >
              <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Blockchain Explorer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => openExternalLink('https://discord.gg/solana')}
            >
              <MaterialCommunityIcons name="discord" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Community</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <MaterialCommunityIcons name="cog" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {helpSections.map((section) => (
        <Card key={section.id} style={styles.sectionCard}>
          <TouchableOpacity onPress={() => toggleSection(section.id)}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <MaterialCommunityIcons 
                    name={section.icon} 
                    size={24} 
                    color={theme.colors.primary}
                    style={styles.sectionIcon}
                  />
                  <Title style={styles.sectionTitle}>{section.title}</Title>
                </View>
                <MaterialCommunityIcons 
                  name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={theme.colors.text} 
                />
              </View>
            </Card.Content>
          </TouchableOpacity>

          {expandedSection === section.id && (
            <Card.Content style={styles.sectionContent}>
              <Divider style={styles.divider} />
              {section.items.map((item, index) => (
                <View key={index} style={styles.faqItem}>
                  <Text style={styles.question}>{item.question}</Text>
                  <Text style={styles.answer}>{item.answer}</Text>
                  {index < section.items.length - 1 && <Divider style={styles.itemDivider} />}
                </View>
              ))}
            </Card.Content>
          )}
        </Card>
      ))}

      <Card style={styles.contactCard}>
        <Card.Content>
          <Title style={styles.contactTitle}>Still need help?</Title>
          <Text style={styles.contactDescription}>
            Can't find what you're looking for? Our support team is here to help.
          </Text>
          
          <View style={styles.contactMethods}>
            <TouchableOpacity 
              style={styles.contactMethod}
              onPress={() => setContactDialogVisible(true)}
            >
              <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
              <Text style={styles.contactMethodText}>Send us a message</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactMethod}
              onPress={() => openExternalLink('https://t.me/solanamemecoinexchange')}
            >
              <MaterialCommunityIcons name="telegram" size={20} color={theme.colors.primary} />
              <Text style={styles.contactMethodText}>Join our Telegram</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog 
          visible={contactDialogVisible} 
          onDismiss={() => setContactDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Contact Support</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogDescription}>
              Describe your issue and we'll get back to you as soon as possible.
            </Text>
            <TextInput
              label="Your Message"
              value={supportMessage}
              onChangeText={setSupportMessage}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={styles.messageInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setContactDialogVisible(false)}>Cancel</Button>
            <Button onPress={submitSupportRequest}>Send</Button>
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
    paddingBottom: 20,
  },
  welcomeCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    marginLeft: 16,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  sectionContent: {
    paddingTop: 0,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
  },
  question: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  itemDivider: {
    backgroundColor: theme.colors.border,
    marginTop: 16,
  },
  contactCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  contactMethods: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactMethod: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
  },
  contactMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogDescription: {
    color: '#888',
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: 'transparent',
  },
});

export default HelpScreen;
