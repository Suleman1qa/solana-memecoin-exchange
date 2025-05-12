import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Title, TextInput, Button, Divider, ActivityIndicator, Snackbar, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWalletDetails, withdrawFunds, clearError, clearSuccess } from '../../store/slices/walletSlice';
import { theme } from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const WithdrawScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenMenuVisible, setTokenMenuVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [withdrawalFee, setWithdrawalFee] = useState('0');
  const [receiveAmount, setReceiveAmount] = useState('0');
  
  const dispatch = useDispatch();
  const { currentWallet, isLoading, error, operationSuccess } = useSelector(state => state.wallet);

  useEffect(() => {
    if (walletId) {
      dispatch(fetchWalletDetails(walletId));
    }
  }, [walletId]);
  
  useEffect(() => {
    // Set SOL as default selected token once wallet is loaded
    if (currentWallet && currentWallet.balances && !selectedToken) {
      const solToken = currentWallet.balances.find(b => b.token.symbol === 'SOL');
      if (solToken) {
        setSelectedToken(solToken.token);
      }
    }
  }, [currentWallet]);
  
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      dispatch(clearError());
    }
  }, [error]);
  
  useEffect(() => {
    if (operationSuccess) {
      setSnackbarMessage('Withdrawal submitted successfully');
      setSnackbarVisible(true);
      
      // Reset form
      setAmount('');
      setDestinationAddress('');
      
      dispatch(clearSuccess());
      
      // Refresh wallet details
      if (walletId) {
        dispatch(fetchWalletDetails(walletId));
      }
    }
  }, [operationSuccess]);
  
  useEffect(() => {
    if (amount && selectedToken) {
      // Calculate withdrawal fee (simulated as 0.1% of the amount)
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue) && amountValue > 0) {
        const fee = amountValue * 0.001;
        setWithdrawalFee(fee.toFixed(8));
        setReceiveAmount((amountValue - fee).toFixed(8));
      } else {
        setWithdrawalFee('0');
        setReceiveAmount('0');
      }
    } else {
      setWithdrawalFee('0');
      setReceiveAmount('0');
    }
  }, [amount, selectedToken]);

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setTokenMenuVisible(false);
  };
  
  const getMaxBalance = () => {
    if (!selectedToken || !currentWallet) return '0';
    
    const tokenBalance = currentWallet.balances.find(
      b => b.token._id === selectedToken._id || (b.token.address === selectedToken.address)
    );
    
    return tokenBalance ? tokenBalance.amount : '0';
  };
  
  const handleSetMaxAmount = () => {
    const maxBalance = getMaxBalance();
    setAmount(maxBalance);
  };
  
  const handleWithdraw = () => {
    Keyboard.dismiss();
    
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
    
    if (!destinationAddress) {
      setSnackbarMessage('Please enter a destination address');
      setSnackbarVisible(true);
      return;
    }
    
    if (parseFloat(amount) > parseFloat(getMaxBalance())) {
      setSnackbarMessage('Insufficient balance');
      setSnackbarVisible(true);
      return;
    }
    
    // Execute withdrawal
    dispatch(withdrawFunds({
      walletId,
      tokenAddress: selectedToken.address,
      amount,
      destinationAddress
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
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Withdraw Funds</Title>
            
            <View style={styles.tokenSelector}>
              <Text style={styles.label}>Select Token</Text>
              <TouchableOpacity
                style={styles.tokenSelectorButton}
                onPress={() => setTokenMenuVisible(true)}
              >
                {selectedToken ? (
                  <View style={styles.selectedTokenButton}>
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
                    Available: {parseFloat(getMaxBalance()).toFixed(8)} {selectedToken.symbol}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Destination Address</Text>
              <TextInput
                value={destinationAddress}
                onChangeText={setDestinationAddress}
                placeholder="Enter Solana address"
                style={styles.input}
                mode="outlined"
                theme={{ colors: { primary: theme.colors.primary } }}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount</Text>
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
            
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Withdrawal Fee</Text>
                <Text style={styles.summaryValue}>
                  {withdrawalFee} {selectedToken?.symbol || ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>You Will Receive</Text>
                <Text style={styles.summaryValue}>
                  {receiveAmount} {selectedToken?.symbol || ''}
                </Text>
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={handleWithdraw}
              style={styles.withdrawButton}
              loading={isLoading}
              disabled={
                !selectedToken || 
                !amount || 
                parseFloat(amount) <= 0 || 
                !destinationAddress ||
                isLoading
              }
            >
              Withdraw
            </Button>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Important Information:</Text>
              <Text style={styles.infoText}>
                • Minimum withdrawal: 0.00001 {selectedToken?.symbol || ''}
              </Text>
              <Text style={styles.infoText}>
                • Withdrawals may take up to 30 minutes to process
              </Text>
              <Text style={styles.infoText}>
                • Double-check the destination address before submitting
              </Text>
            </View>
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
        <ScrollView style={styles.tokenList}>
          {currentWallet?.balances.map(balance => (
            <TouchableOpacity
              key={balance.token._id}
              style={styles.tokenItem}
              onPress={() => handleTokenSelect(balance.token)}
            >
              <View style={styles.tokenItemContent}>
                <Text style={styles.tokenSymbol}>{balance.token.symbol}</Text>
                <Text style={styles.tokenName}>{balance.token.name}</Text>
              </View>
              <Text style={styles.tokenBalance}>
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
  contentContainer: {
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
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.colors.text,
  },
  tokenSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  tokenSelectorButton: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTokenButton: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceText: {
    fontSize: 12,
    color: '#888',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'transparent',
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
  summaryContainer: {
    marginBottom: 24,
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
  withdrawButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: 24,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
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
  },
  tokenList: {
    maxHeight: 300,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tokenItemContent: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 12,
    color: '#888',
  },
  tokenBalance: {
    fontSize: 14,
    color: theme.colors.text,
  },
});

export default WithdrawScreen;