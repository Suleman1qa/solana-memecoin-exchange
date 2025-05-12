import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Title, Divider, IconButton, ActivityIndicator, Snackbar, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWalletDetails, swapTokens, clearError, clearSuccess } from '../../store/slices/walletSlice';
import { fetchTokens } from '../../store/slices/tokenSlice';
import { theme } from '../../theme';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SwapScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [amount, setAmount] = useState('');
  const [slippageTolerance, setSlippageTolerance] = useState('1');
  const [tokenMenuVisible, setTokenMenuVisible] = useState(false);
  const [isSelectingFromToken, setIsSelectingFromToken] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exchangeRate, setExchangeRate] = useState('0');
  const [expectedOutput, setExpectedOutput] = useState('0');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const { currentWallet, isLoading, error, operationSuccess } = useSelector(state => state.wallet);
  const { tokens } = useSelector(state => state.token);

  useEffect(() => {
    if (walletId) {
      dispatch(fetchWalletDetails(walletId));
    }
    
    dispatch(fetchTokens({ category: 'all', limit: 50 }));
  }, [walletId]);
  
  useEffect(() => {
    if (fromToken && toToken) {
      calculateExchangeRate();
    }
  }, [fromToken, toToken, amount]);
  
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      dispatch(clearError());
    }
  }, [error]);
  
  useEffect(() => {
    if (operationSuccess) {
      setSnackbarMessage('Swap completed successfully');
      setSnackbarVisible(true);
      setAmount('');
      dispatch(clearSuccess());
      
      // Refresh wallet details
      if (walletId) {
        dispatch(fetchWalletDetails(walletId));
      }
    }
  }, [operationSuccess]);

  const calculateExchangeRate = () => {
    if (!fromToken || !toToken) return;
    
    // Get token prices
    const fromPrice = parseFloat(fromToken.priceUSD);
    const toPrice = parseFloat(toToken.priceUSD);
    
    if (isNaN(fromPrice) || isNaN(toPrice) || fromPrice === 0) {
      setExchangeRate('0');
      setExpectedOutput('0');
      return;
    }
    
    // Calculate exchange rate
    const rate = toPrice / fromPrice;
    setExchangeRate(rate.toFixed(8));
    
    // Calculate expected output
    if (amount && !isNaN(parseFloat(amount))) {
      const output = parseFloat(amount) * rate;
      setExpectedOutput(output.toFixed(8));
    } else {
      setExpectedOutput('0');
    }
  };
  
  const handleSwapTokens = () => {
    // Swap fromToken and toToken
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
  };
  
  const openTokenMenu = (isFrom) => {
    setIsSelectingFromToken(isFrom);
    setTokenMenuVisible(true);
  };
  
  const selectToken = (token) => {
    if (isSelectingFromToken) {
      setFromToken(token);
    } else {
      setToToken(token);
    }
    setTokenMenuVisible(false);
    setSearchQuery('');
  };
  
  const executeSwap = () => {
    if (!fromToken || !toToken || !amount || parseFloat(amount) <= 0) {
      setSnackbarMessage('Please enter a valid amount');
      setSnackbarVisible(true);
      return;
    }
    
    dispatch(swapTokens({
      walletId,
      fromTokenAddress: fromToken.address,
      toTokenAddress: toToken.address,
      amount,
      slippageTolerance
    }));
  };

  const filteredTokens = tokens.filter(token => {
    if (!searchQuery) return true;
    
    return (
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  
  const getTokenBalance = (token) => {
    if (!currentWallet || !token) return '0';
    
    const tokenBalance = currentWallet.balances.find(
      b => b.token._id === token._id || (b.token.address === token.address)
    );
    
    return tokenBalance ? tokenBalance.amount : '0';
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Swap</Title>
            <Text style={styles.cardSubtitle}>Trade tokens in an instant</Text>
            
            <View style={styles.fromTokenContainer}>
              <Text style={styles.sectionTitle}>From</Text>
              
              <View style={styles.tokenInputContainer}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => openTokenMenu(true)}
                >
                  {fromToken ? (
                    <View style={styles.selectedToken}>
                      <Text style={styles.tokenSymbol}>{fromToken.symbol}</Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
                    </View>
                  ) : (
                    <Text style={styles.selectTokenText}>Select Token</Text>
                  )}
                </TouchableOpacity>
                
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0.0"
                  style={styles.amountInput}
                  mode="outlined"
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
              
              {fromToken && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    Balance: {parseFloat(getTokenBalance(fromToken)).toFixed(6)} {fromToken.symbol}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAmount(getTokenBalance(fromToken))}
                  >
                    <Text style={styles.maxButton}>MAX</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            <View style={styles.swapButtonContainer}>
              <IconButton
                icon="swap-vertical"
                color={theme.colors.primary}
                size={24}
                style={styles.swapButton}
                onPress={handleSwapTokens}
              />
            </View>
            
            <View style={styles.toTokenContainer}>
              <Text style={styles.sectionTitle}>To</Text>
              
              <View style={styles.tokenInputContainer}>
                <TouchableOpacity
                  style={styles.tokenSelector}
                  onPress={() => openTokenMenu(false)}
                >
                  {toToken ? (
                    <View style={styles.selectedToken}>
                      <Text style={styles.tokenSymbol}>{toToken.symbol}</Text>
                      <MaterialIcons name="arrow-drop-down" size={20} color={theme.colors.text} />
                    </View>
                  ) : (
                    <Text style={styles.selectTokenText}>Select Token</Text>
                  )}
                </TouchableOpacity>
                
                <View style={styles.expectedOutputContainer}>
                  <Text style={styles.expectedOutputValue}>
                    {expectedOutput}
                  </Text>
                </View>
              </View>
              
              {toToken && (
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceText}>
                    Balance: {parseFloat(getTokenBalance(toToken)).toFixed(6)} {toToken.symbol}
                  </Text>
                </View>
              )}
            </View>
            
            {fromToken && toToken && (
              <View style={styles.exchangeRateContainer}>
                <Text style={styles.exchangeRateText}>
                  1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                </Text>
              </View>
            )}
            
            <View style={styles.slippageContainer}>
              <Text style={styles.slippageTitle}>Slippage Tolerance</Text>
              <View style={styles.slippageButtons}>
                {['0.5', '1', '2', '3'].map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.slippageButton,
                      slippageTolerance === value && styles.activeSlippageButton
                    ]}
                    onPress={() => setSlippageTolerance(value)}
                  >
                    <Text style={[
                      styles.slippageButtonText,
                      slippageTolerance === value && styles.activeSlippageButtonText
                    ]}>
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <Button
              mode="contained"
              onPress={executeSwap}
              style={styles.swapActionButton}
              loading={isLoading}
              disabled={!fromToken || !toToken || !amount || parseFloat(amount) <= 0 || isLoading}
            >
              Swap
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Portal>
        <Menu
          visible={tokenMenuVisible}
          onDismiss={() => setTokenMenuVisible(false)}
          style={styles.tokenMenu}
          contentStyle={styles.tokenMenuContent}
        >
          <View style={styles.tokenMenuHeader}>
            <Title style={styles.tokenMenuTitle}>
              Select a token
            </Title>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setTokenMenuVisible(false)}
            />
          </View>
          
          <TextInput
            placeholder="Search token by name or symbol"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            mode="outlined"
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          
          <Divider style={styles.divider} />
          
          <ScrollView style={styles.tokenList}>
            {filteredTokens.map(token => (
              <TouchableOpacity
                key={token._id}
                style={styles.tokenItem}
                onPress={() => selectToken(token)}
              >
                <View style={styles.tokenItemLeft}>
                  <Text style={styles.tokenItemSymbol}>{token.symbol}</Text>
                  <Text style={styles.tokenItemName}>{token.name}</Text>
                </View>
                <Text style={styles.tokenItemBalance}>
                  {parseFloat(getTokenBalance(token)).toFixed(4)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Menu>
      </Portal>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={styles.snackbar}
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
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
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
  fromTokenContainer: {
    marginBottom: 16,
  },
  toTokenContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  tokenInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenSelector: {
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 4,
  },
  selectTokenText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,
  },
  expectedOutputContainer: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  expectedOutputValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceText: {
    fontSize: 12,
    color: '#888',
  },
  maxButton: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    backgroundColor: '#333',
    borderWidth: 3,
    borderColor: theme.colors.background,
  },
  exchangeRateContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  exchangeRateText: {
    fontSize: 14,
    color: '#888',
  },
  slippageContainer: {
    marginBottom: 24,
  },
  slippageTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  slippageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slippageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    minWidth: 60,
    alignItems: 'center',
  },
  activeSlippageButton: {
    backgroundColor: theme.colors.primary,
  },
  slippageButtonText: {
    color: '#888',
    fontWeight: 'bold',
  },
  activeSlippageButtonText: {
    color: theme.colors.text,
  },
  swapActionButton: {
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
  },
  tokenMenu: {
    width: '100%',
    maxWidth: '100%',
    marginTop: 50,
    marginLeft: 0,
    marginRight: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tokenMenuContent: {
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  tokenMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchInput: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  tokenList: {
    maxHeight: 400,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tokenItemLeft: {
    flex: 1,
  },
  tokenItemSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tokenItemName: {
    fontSize: 12,
    color: '#888',
  },
  tokenItemBalance: {
    fontSize: 14,
    color: theme.colors.text,
  },
  snackbar: {
    backgroundColor: theme.colors.surface,
  },
});

export default SwapScreen;