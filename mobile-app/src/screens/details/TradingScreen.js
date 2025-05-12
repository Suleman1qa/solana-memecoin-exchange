import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Card, Title, TextInput, Button, Divider, ActivityIndicator, Snackbar, IconButton, Menu } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { fetchTokenDetails, fetchTokenPriceHistory } from '../../store/slices/tokenSlice';
import { fetchWallets } from '../../store/slices/walletSlice';
import { fetchOrderBook, fetchRecentTrades, placeOrder, resetOrderPlaced, fetchUserOrders } from '../../store/slices/marketSlice';
import { theme } from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const TradingScreen = ({ route, navigation }) => {
  const { tokenAddress } = route.params;
  const [orderType, setOrderType] = useState('MARKET');
  const [side, setSide] = useState('BUY');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [menuVisible, setMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [pairId, setPairId] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [totalCost, setTotalCost] = useState('0');
  
  const intervalRef = useRef(null);
  
  const dispatch = useDispatch();
  const { currentToken, priceHistory, isLoading: tokenLoading } = useSelector(state => state.token);
  const { orderBook, recentTrades, isLoading: marketLoading, orderPlaced, error: marketError } = useSelector(state => state.market);
  const { wallets } = useSelector(state => state.wallet);

  useEffect(() => {
    loadInitialData();
    
    // Set up interval for refreshing data
    intervalRef.current = setInterval(() => {
      if (pairId) {
        dispatch(fetchOrderBook({ pairId }));
        dispatch(fetchRecentTrades({ pairId }));
      }
    }, 15000); // refresh every 15 seconds
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tokenAddress]);

  useEffect(() => {
    if (currentToken) {
      loadPriceHistory();
      // Find or create pair ID
      // In a real app, this would come from the backend
      setPairId(`SOL_${currentToken.symbol}`);
    }
  }, [currentToken, selectedTimeframe]);
  
  useEffect(() => {
    if (pairId) {
      dispatch(fetchOrderBook({ pairId }));
      dispatch(fetchRecentTrades({ pairId }));
      dispatch(fetchUserOrders({ pairId }));
    }
  }, [pairId]);

  useEffect(() => {
    if (orderPlaced) {
      setSnackbarMessage('Order placed successfully');
      setSnackbarVisible(true);
      setAmount('');
      setPrice('');
      dispatch(resetOrderPlaced());
      
      // Refresh orders and wallet
      dispatch(fetchUserOrders({ pairId }));
      if (wallet) {
        dispatch(fetchWallets());
      }
    }
  }, [orderPlaced]);
  
  useEffect(() => {
    if (marketError) {
      setSnackbarMessage(marketError);
      setSnackbarVisible(true);
    }
  }, [marketError]);
  
  useEffect(() => {
    // Calculate total cost when amount or price changes
    if (amount && (orderType === 'MARKET' || price)) {
      const amountValue = parseFloat(amount) || 0;
      const priceValue = orderType === 'MARKET' 
        ? parseFloat(currentToken?.priceUSD || 0) 
        : parseFloat(price) || 0;
        
      setTotalCost((amountValue * priceValue).toFixed(8));
    } else {
      setTotalCost('0');
    }
  }, [amount, price, orderType, currentToken]);

  const loadInitialData = async () => {
    dispatch(fetchTokenDetails(tokenAddress));
    dispatch(fetchWallets());
  };

  const loadPriceHistory = async () => {
    dispatch(fetchTokenPriceHistory({
      address: tokenAddress,
      interval: selectedTimeframe === '1h' ? '1m' : 
                selectedTimeframe === '24h' ? '5m' : 
                selectedTimeframe === '7d' ? '1h' : 
                selectedTimeframe === '30d' ? '4h' : '1d',
    }));
  };
  
  const handlePlaceOrder = () => {
    if (!pairId || !amount) {
      setSnackbarMessage('Please enter an amount');
      setSnackbarVisible(true);
      return;
    }
    
    if (orderType !== 'MARKET' && !price) {
      setSnackbarMessage('Please enter a price');
      setSnackbarVisible(true);
      return;
    }
    
    dispatch(placeOrder({
      pairId,
      type: orderType,
      side,
      amount,
      price: orderType === 'MARKET' ? null : price,
    }));
  };
  
  const handleWalletSelect = (selectedWallet) => {
    setWallet(selectedWallet);
    setMenuVisible(false);
  };
  
  const setOrderPercentage = (percentage) => {
    if (!wallet) return;
    
    // If buying, calculate based on SOL balance
    // If selling, calculate based on token balance
    const tokenBalance = parseFloat(
      side === 'BUY' 
        ? wallet.balances.find(b => b.token.symbol === 'SOL')?.amount || 0
        : wallet.balances.find(b => b.token.address === tokenAddress)?.amount || 0
    );
    
    const currentPrice = orderType === 'MARKET' 
      ? parseFloat(currentToken?.priceUSD || 0) 
      : parseFloat(price) || 0;
      
    if (side === 'BUY') {
      // Calculate how much token can be bought
      const maxTokens = (tokenBalance * percentage) / currentPrice;
      setAmount(maxTokens.toFixed(8));
    } else {
      // Calculate how much token can be sold
      const maxTokens = tokenBalance * percentage;
      setAmount(maxTokens.toFixed(8));
    }
  };

  const renderChartData = () => {
    if (!priceHistory || !priceHistory[selectedTimeframe]) {
      return {
        labels: [],
        datasets: [
          {
            data: [0],
            color: () => theme.colors.primary,
          },
        ],
      };
    }

    const data = priceHistory[selectedTimeframe];
    const prices = data.map(item => parseFloat(item.price));
    const labels = [];

    // Generate labels based on timeframe
    if (selectedTimeframe === '1h') {
      for (let i = 0; i < data.length; i += 10) {
        const date = new Date(data[i].timestamp);
        labels.push(`${date.getHours()}:${date.getMinutes()}`);
      }
    } else if (selectedTimeframe === '24h') {
      for (let i = 0; i < data.length; i += 6) {
        const date = new Date(data[i].timestamp);
        labels.push(`${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`);
      }
    } else if (selectedTimeframe === '7d') {
      for (let i = 0; i < data.length; i += 24) {
        const date = new Date(data[i].timestamp);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      }
    } else {
      for (let i = 0; i < data.length; i += 7) {
        const date = new Date(data[i].timestamp);
        labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      }
    }

    const color = (opacity = 1) => {
      // Determine chart color based on price change (green for up, red for down)
      const firstPrice = prices[0] || 0;
      const lastPrice = prices[prices.length - 1] || 0;
      const priceChange = lastPrice - firstPrice;
      
      return priceChange >= 0 ? 
        theme.colors.positive : 
        theme.colors.negative;
    };

    return {
      labels,
      datasets: [
        {
          data: prices,
          color: color,
        },
      ],
    };
  };
  
  const renderOrderBook = () => {
    if (!orderBook || marketLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    
    const maxBidAmount = Math.max(...orderBook.bids.map(bid => parseFloat(bid.amount)));
    const maxAskAmount = Math.max(...orderBook.asks.map(ask => parseFloat(ask.amount)));
    const maxAmount = Math.max(maxBidAmount, maxAskAmount);
    
    return (
      <View style={styles.orderBookContainer}>
        <View style={styles.orderBookHeader}>
          <Text style={styles.columnHeader}>Price</Text>
          <Text style={styles.columnHeader}>Amount</Text>
          <Text style={styles.columnHeader}>Total</Text>
        </View>
        
        <View style={styles.asksContainer}>
          {orderBook.asks.slice(0, 5).reverse().map((ask, index) => (
            <TouchableOpacity 
              key={`ask-${index}`} 
              style={styles.orderRow}
              onPress={() => {
                setSide('BUY');
                setPrice(ask.price);
              }}
            >
              <View 
                style={[
                  styles.depthBar, 
                  styles.askDepthBar,
                  { width: `${(parseFloat(ask.amount) / maxAmount) * 100}%` }
                ]} 
              />
              <Text style={styles.askPrice}>{parseFloat(ask.price).toFixed(8)}</Text>
              <Text style={styles.amount}>{parseFloat(ask.amount).toFixed(4)}</Text>
              <Text style={styles.total}>
                {(parseFloat(ask.price) * parseFloat(ask.amount)).toFixed(4)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.spreadContainer}>
          <Text style={styles.spreadText}>
            Spread: {
              orderBook.asks.length > 0 && orderBook.bids.length > 0 ?
              (parseFloat(orderBook.asks[0].price) - parseFloat(orderBook.bids[0].price)).toFixed(8) :
              '0.00000000'
            }
          </Text>
        </View>
        
        <View style={styles.bidsContainer}>
          {orderBook.bids.slice(0, 5).map((bid, index) => (
            <TouchableOpacity 
              key={`bid-${index}`} 
              style={styles.orderRow}
              onPress={() => {
                setSide('SELL');
                setPrice(bid.price);
              }}
            >
              <View 
                style={[
                  styles.depthBar, 
                  styles.bidDepthBar,
                  { width: `${(parseFloat(bid.amount) / maxAmount) * 100}%` }
                ]} 
              />
              <Text style={styles.bidPrice}>{parseFloat(bid.price).toFixed(8)}</Text>
              <Text style={styles.amount}>{parseFloat(bid.amount).toFixed(4)}</Text>
              <Text style={styles.total}>
                {(parseFloat(bid.price) * parseFloat(bid.amount)).toFixed(4)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderRecentTrades = () => {
    if (!recentTrades || marketLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      );
    }
    
    return (
      <View style={styles.tradesContainer}>
        <View style={styles.tradesHeader}>
          <Text style={styles.columnHeader}>Price</Text>
          <Text style={styles.columnHeader}>Amount</Text>
          <Text style={styles.columnHeader}>Time</Text>
        </View>
        
        {recentTrades.slice(0, 10).map((trade, index) => (
          <View key={`trade-${index}`} style={styles.tradeRow}>
            <Text style={[
              styles.tradePrice,
              trade.side === 'BUY' ? styles.bidPrice : styles.askPrice
            ]}>
              {parseFloat(trade.price).toFixed(8)}
            </Text>
            <Text style={styles.tradeAmount}>{parseFloat(trade.amount).toFixed(4)}</Text>
            <Text style={styles.tradeTime}>
              {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (tokenLoading && !currentToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentToken) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Token not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <ScrollView style={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.tokenHeader}>
              <Title style={styles.tokenSymbol}>{currentToken.symbol}/SOL</Title>
              <View style={styles.tokenPrice}>
                <Text style={styles.price}>${parseFloat(currentToken.priceUSD).toFixed(8)}</Text>
                <Text style={[
                  styles.priceChange,
                  parseFloat(currentToken.priceChange24h) >= 0 ? 
                    styles.positiveChange : 
                    styles.negativeChange
                ]}>
                  {parseFloat(currentToken.priceChange24h) >= 0 ? '+' : ''}
                  {currentToken.priceChange24h}%
                </Text>
              </View>
            </View>
            
   <View style={styles.timeframeSelector}>
              {['1h', '24h', '7d', '30d', 'all'].map((timeframe) => (
                <TouchableOpacity
                  key={timeframe}
                  style={[
                    styles.timeframeButton,
                    selectedTimeframe === timeframe && styles.selectedTimeframeButton,
                  ]}
                  onPress={() => setSelectedTimeframe(timeframe)}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      selectedTimeframe === timeframe && styles.selectedTimeframeText,
                    ]}
                  >
                    {timeframe.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {tokenLoading ? (
              <View style={styles.chartLoadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <LineChart
                data={renderChartData()}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: theme.colors.surface,
                  backgroundGradientFrom: theme.colors.surface,
                  backgroundGradientTo: theme.colors.surface,
                  decimalPlaces: 8,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '2',
                    strokeWidth: '1',
                    stroke: theme.colors.primary,
                  },
                }}
                bezier
                style={styles.chart}
                withDots={false}
                withInnerLines={false}
                withOuterLines={true}
                withVerticalLines={false}
                withHorizontalLines={true}
                yAxisInterval={20}
              />
            )}
          </Card.Content>
        </Card>
        
        <Card style={styles.orderBookCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Order Book</Title>
            {renderOrderBook()}
          </Card.Content>
        </Card>
        
        <Card style={styles.tradesCard}>
          <Card.Content>
            <Title style={styles.cardTitle}>Recent Trades</Title>
            {renderRecentTrades()}
          </Card.Content>
        </Card>
        
        <Card style={styles.orderCard}>
          <Card.Content>
            <View style={styles.orderTypeRow}>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === 'MARKET' && styles.activeOrderType,
                ]}
                onPress={() => setOrderType('MARKET')}
              >
                <Text style={[
                  styles.orderTypeText,
                  orderType === 'MARKET' && styles.activeOrderTypeText,
                ]}>
                  Market
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.orderTypeButton,
                  orderType === 'LIMIT' && styles.activeOrderType,
                ]}
                onPress={() => setOrderType('LIMIT')}
              >
                <Text style={[
                  styles.orderTypeText,
                  orderType === 'LIMIT' && styles.activeOrderTypeText,
                ]}>
                  Limit
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.walletSelector}>
              <Text style={styles.walletLabel}>Wallet:</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.walletDropdown}
                    onPress={() => setMenuVisible(true)}
                  >
                    <Text style={styles.walletName}>
                      {wallet?.label || 'Select Wallet'}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                }
              >
                {wallets.map(w => (
                  <Menu.Item
                    key={w._id}
                    onPress={() => handleWalletSelect(w)}
                    title={w.label}
                  />
                ))}
              </Menu>
            </View>
            
            <View style={styles.orderSideRow}>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  styles.buyButton,
                  side === 'BUY' && styles.activeBuyButton,
                ]}
                onPress={() => setSide('BUY')}
              >
                <Text style={[
                  styles.sideButtonText,
                  side === 'BUY' && styles.activeSideButtonText,
                ]}>
                  Buy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sideButton,
                  styles.sellButton,
                  side === 'SELL' && styles.activeSellButton,
                ]}
                onPress={() => setSide('SELL')}
              >
                <Text style={[
                  styles.sideButtonText,
                  side === 'SELL' && styles.activeSideButtonText,
                ]}>
                  Sell
                </Text>
              </TouchableOpacity>
            </View>
            
            {orderType !== 'MARKET' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Price (SOL)</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  mode="outlined"
                  style={styles.input}
                  theme={{ colors: { primary: theme.colors.primary } }}
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount ({currentToken.symbol})</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary } }}
              />
            </View>
            
            <View style={styles.percentageRow}>
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={styles.percentageButton}
                  onPress={() => setOrderPercentage(pct)}
                >
                  <Text style={styles.percentageText}>{pct * 100}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{totalCost} SOL</Text>
            </View>
            
            <Button
              mode="contained"
              onPress={handlePlaceOrder}
              style={[
                styles.orderButton,
                side === 'BUY' ? styles.buyOrderButton : styles.sellOrderButton,
              ]}
              loading={marketLoading}
              disabled={!wallet || !amount || (orderType !== 'MARKET' && !price) || marketLoading}
            >
              {`${side} ${currentToken.symbol}`}
            </Button>
          </Card.Content>
        </Card>
        
        <View style={styles.footer} />
      </ScrollView>
      
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
  },
  card: {
    margin: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  orderBookCard: {
    margin: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  tradesCard: {
    margin: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  orderCard: {
    margin: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 12,
    color: theme.colors.text,
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tokenPrice: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveChange: {
    color: theme.colors.positive,
  },
  negativeChange: {
    color: theme.colors.negative,
  },
  timeframeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  timeframeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  selectedTimeframeButton: {
    backgroundColor: theme.colors.primary,
  },
  timeframeText: {
    color: '#888',
    fontWeight: 'bold',
  },
  selectedTimeframeText: {
    color: theme.colors.text,
  },
  chartLoadingContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  orderBookContainer: {
    marginTop: 8,
  },
  orderBookHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
  asksContainer: {
    marginBottom: 8,
  },
  bidsContainer: {
    marginTop: 8,
  },
  orderRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
    position: 'relative',
  },
  depthBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    height: '100%',
    opacity: 0.1,
  },
  askDepthBar: {
    backgroundColor: theme.colors.negative,
  },
  bidDepthBar: {
    backgroundColor: theme.colors.positive,
  },
  askPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.negative,
  },
  bidPrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.positive,
  },
  amount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.text,
  },
  total: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: '#888',
  },
  spreadContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  spreadText: {
    fontSize: 12,
    color: '#888',
  },
  tradesContainer: {
    marginTop: 8,
  },
  tradesHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  tradeRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tradePrice: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
  },
  tradeAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: theme.colors.text,
  },
  tradeTime: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: '#888',
  },
  orderTypeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeOrderType: {
    borderColor: theme.colors.primary,
  },
  orderTypeText: {
    fontSize: 16,
    color: '#888',
  },
  activeOrderTypeText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  walletSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletLabel: {
    fontSize: 14,
    color: '#888',
    marginRight: 8,
  },
  walletDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 4,
  },
  orderSideRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sideButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  buyButton: {
    backgroundColor: 'rgba(20, 241, 149, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.positive,
  },
  sellButton: {
    backgroundColor: 'rgba(255, 85, 85, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.negative,
  },
  activeBuyButton: {
    backgroundColor: theme.colors.positive,
  },
  activeSellButton: {
    backgroundColor: theme.colors.negative,
  },
  sideButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeSideButtonText: {
    color: '#000',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'transparent',
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  percentageButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  percentageText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: 14,
    color: '#888',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  orderButton: {
    paddingVertical: 6,
  },
  buyOrderButton: {
    backgroundColor: theme.colors.positive,
  },
  sellOrderButton: {
    backgroundColor: theme.colors.negative,
  },
  snackbar: {
    backgroundColor: theme.colors.surface,
  },
  footer: {
    height: 60,
  },
});

export default TradingScreen;