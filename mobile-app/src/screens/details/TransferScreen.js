import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Title, TextInput, Button, Divider, ActivityIndicator, Snackbar, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallets, fetchWalletDetails, transferBetweenWallets, clearError, clearSuccess } from '../../store/slices/walletSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const TransferScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [selectedToken, setSelectedToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [tokenMenuVisible, setTokenMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const { wallets, currentWallet, isLoading, error, operationSuccess } = useSelector(state => state.wallet);

  // Find funding and spot wallets
  const fundingWallet = wallets.find(w => w.type === 'FUNDING');
  const spotWallet = wallets.find(w => w.type === 'SPOT');

  useEffect(() => {
    dispatch(fetchWallets());
    if (walletId) {
      dispatch(fetchWalletDetails(walletId));
    }
  }, [walletId]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (operationSuccess) {
      setSnackbarMessage('Transfer completed successfully');
      setSnackbarVisible(true);
      setAmount('');
      dispatch(clearSuccess());
      
      // Refresh wallet details
      dispatch(fetchWalletDetails(walletId));
    }
  }, [operationSuccess, walletId]);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setTokenMenuVisible(false);
  };

  const getTokenBalance = (token) => {
    if (!fundingWallet || !token) return '0';
    
    const tokenBalance = fundingWallet.balances.find(
      b => b.token._id === token._id || b.token.address === token.address
    );
    
    return tokenBalance ? tokenBalance.amount : '0';
  };

  const getAvailableTokens = () => {
    if (!fundingWallet || !fundingWallet.balances) return [];
    
    return fundingWallet.balances.filter(balance => parseFloat(balance.amount) > 0);
  };

  const handleSetMaxAmount = () => {
    if (selectedToken) {
      const maxBalance = getTokenBalance(selectedToken);
      setAmount(maxBalance);
    }
  };

  const handleTransfer = () => {
    if (!selectedToken) {
      setSnackbarMessage('Please select a token');
      setSnackbarVisible(true);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setSnackbarMessage('Please enter a valid amount');
      setSnackbarVisible(true);
      return;
    }

    const availableBalance = parseFloat(getTokenBalance(selectedToken));
    if (parseFloat(amount) > availableBalance) {
      setSnackbarMessage('Insufficient balance');
      setSnackbarVisible(true);
      return;
    }

    dispatch(transferBetweenWallets({
      sourceWalletId: fundingWallet._id,
      destinationWalletId: spotWallet._id,
      tokenAddress: selectedToken.address,
      amount
    }));
  };

  if (isLoading && !currentWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Transfer Funds</Title>
            <Text style={styles.cardSubtitle}>
              Transfer tokens between your wallets
            </Text>

            <View style={styles.fromSection}>
              <Text style={styles.sectionTitle}>From</Text>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Funding</Text>
                <Text style={styles.walletAddress}>
                  {fundingWallet?.address?.substring(0, 8)}...{fundingWallet?.address?.slice(-4)}
                </Text>
              </View>
            </View>

            <View style={styles.tokenSection}>
              <Text style={styles.sectionTitle}>Select Token</Text>
              <TouchableOpacity
                style={styles.tokenSelector}
                onPress={() => setTokenMenuVisible(true)}
              >
                {selectedToken ? (
                  <View style={styles.selectedTokenContainer}>
                    <Text style={styles.selectedTokenText}>{selectedToken.symbol}</Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colors.text} />
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Select token</Text>
                )}
              </TouchableOpacity>

              {selectedToken && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    Available: {parseFloat(getTokenBalance(selectedToken)).toFixed(6)} {selectedToken.symbol}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.destinationSection}>
              <Text style={styles.sectionTitle}>To</Text>
              <View style={styles.walletInfo}>
                <Text style={styles.walletLabel}>Spot</Text>
                <Text style={styles.walletAddress}>
                  {spotWallet?.address?.substring(0, 8)}...{spotWallet?.address?.slice(-4)}
                </Text>
              </View>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.0"
                  keyboardType="numeric"
                  style={styles.amountInput}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
                <TouchableOpacity
                  style={styles.maxButton}
                  onPress={handleSetMaxAmount}
                >
                  <Text style={styles.maxButtonText}>MAX</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Transfer Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>From:</Text>
                <Text style={styles.summaryValue}>Funding</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>To:</Text>
                <Text style={styles.summaryValue}>Spot</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Token:</Text>
                <Text style={styles.summaryValue}>{selectedToken?.symbol || 'Not selected'}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount:</Text>
                <Text style={styles.summaryValue}>{amount || '0'}</Text>
              </View>
            </View>

            <Button
              mode="contained"
              onPress={handleTransfer}
              style={styles.transferButton}
              loading={isLoading}
              disabled={
                !selectedToken ||
                !amount ||
                parseFloat(amount) <= 0 ||
                isLoading
              }
            >
              Transfer
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Menu
        visible={tokenMenuVisible}
        onDismiss={() => setTokenMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.menu}
        contentStyle={styles.menuContent}
      >
        <Title style={styles.menuTitle}>Select Token</Title>
        <Divider style={styles.menuDivider} />
        <ScrollView style={styles.menuList}>
          {getAvailableTokens().map(balance => (
            <TouchableOpacity
              key={balance.token._id}
              style={styles.menuItem}
              onPress={() => handleTokenSelect(balance.token)}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemSymbol}>{balance.token.symbol}</Text>
                <Text style={styles.menuItemName}>{balance.token.name}</Text>
              </View>
              <Text style={styles.menuItemBalance}>
                {parseFloat(balance.amount).toFixed(6)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Menu>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  fromSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  walletInfo: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
  },
  walletLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
  tokenSection: {
    marginBottom: 24,
  },
  tokenSelector: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedTokenText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balanceText: {
    fontSize: 12,
    color: '#888',
  },
  destinationSection: {
    marginBottom: 24,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  maxButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  maxButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  transferButton: {
    backgroundColor: theme.colors.primary,
  },
  menu: {
    width: '90%',
    alignSelf: 'center',
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: 16,
  },
  menuDivider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemIcon: {
    marginRight: 12,
  },
  menuItemSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
});

export default TransferScreen;