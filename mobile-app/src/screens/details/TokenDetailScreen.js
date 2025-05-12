import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Title, Button, Chip, ActivityIndicator, IconButton, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { fetchTokenDetails, fetchTokenPriceHistory } from '../../store/slices/tokenSlice';
import { theme } from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const TokenDetailScreen = ({ route, navigation }) => {
  const { tokenAddress } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const dispatch = useDispatch();
  const { currentToken, priceHistory, isLoading } = useSelector(state => state.token);

  useEffect(() => {
    loadData();
  }, [tokenAddress]);

  useEffect(() => {
    if (currentToken) {
      loadPriceHistory();
    }
  }, [currentToken, selectedTimeframe]);

  const loadData = async () => {
    dispatch(fetchTokenDetails(tokenAddress));
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToTrading = () => {
    navigation.navigate('Trading', { tokenAddress });
  };

  const renderSocialLinks = () => {
    if (!currentToken) return null;
    
    const links = [];
    
    if (currentToken.website) {
      links.push(
        <IconButton
          key="website"
          icon="web"
          color={theme.colors.primary}
          size={22}
          onPress={() => Linking.openURL(currentToken.website)}
          style={styles.socialIcon}
        />
      );
    }
    
    if (currentToken.twitter) {
      links.push(
        <IconButton
          key="twitter"
          icon="twitter"
          color="#1DA1F2"
          size={22}
          onPress={() => Linking.openURL(currentToken.twitter)}
          style={styles.socialIcon}
        />
      );
    }
    
    if (currentToken.telegram) {
      links.push(
        <IconButton
          key="telegram"
          icon="telegram"
          color="#0088cc"
          size={22}
          onPress={() => Linking.openURL(currentToken.telegram)}
          style={styles.socialIcon}
        />
      );
    }
    
    if (currentToken.discord) {
      links.push(
        <IconButton
          key="discord"
          icon="discord"
          color="#7289DA"
          size={22}
          onPress={() => Linking.openURL(currentToken.discord)}
          style={styles.socialIcon}
        />
      );
    }
    
    return links.length > 0 ? (
      <View style={styles.socialLinks}>
        {links}
      </View>
    ) : null;
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

  if (isLoading && !refreshing && !currentToken) {
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

  const priceChangeColor = parseFloat(currentToken.priceChange24h) >= 0
    ? theme.colors.positive
    : theme.colors.negative;

  const priceChangeSign = parseFloat(currentToken.priceChange24h) >= 0 ? '+' : '';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.tokenHeader}>
            <View style={styles.tokenInfo}>
              <View style={styles.nameContainer}>
                <Title style={styles.tokenSymbol}>{currentToken.symbol}</Title>
                <Chip 
                  style={[
                    styles.statusChip, 
                    currentToken.status === 'NEW' ? styles.newChip :
                    currentToken.status === 'GRADUATING' ? styles.graduatingChip :
                    styles.graduatedChip
                  ]}
                >
                  {currentToken.status}
                </Chip>
              </View>
              <Text style={styles.tokenName}>{currentToken.name}</Text>
            </View>
            {renderSocialLinks()}
          </View>

          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>${parseFloat(currentToken.priceUSD).toFixed(8)}</Text>
              <Text style={[styles.priceChange, { color: priceChangeColor }]}>
                {priceChangeSign}{currentToken.priceChange24h}% (24h)
              </Text>
            </View>
            
            <Button
              mode="contained"
              onPress={navigateToTrading}
              style={styles.tradeButton}
            >
              Trade
            </Button>
          </View>
        </Card.Content>
      </Card>
      <Card style={styles.chartCard}>
        <Card.Content>
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

          {isLoading && !refreshing ? (
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
        <Card.Content>
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

          {isLoading && !refreshing ? (
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
              yAxisInterval={20} /> )} </Card.Content>

  <Card style={styles.card}>
    <Card.Content>
      <Title style={styles.sectionTitle}>Market Stats</Title>
      <Divider style={styles.divider} />
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>
            ${numberWithCommas(parseFloat(currentToken.marketCapUSD || 0).toFixed(2))}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Volume (24h)</Text>
          <Text style={styles.statValue}>
            ${numberWithCommas(parseFloat(currentToken.volume24h || 0).toFixed(2))}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Liquidity</Text>
          <Text style={styles.statValue}>
            ${numberWithCommas(parseFloat(currentToken.liquidityUSD || 0).toFixed(2))}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Supply</Text>
          <Text style={styles.statValue}>
            {numberWithCommas(parseFloat(currentToken.totalSupply || 0).toFixed(0))}
          </Text>
        </View>
        
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Launch Date</Text>
          <Text style={styles.statValue}>
            {new Date(currentToken.launchDate).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Contract Address</Text>
          <TouchableOpacity 
            onPress={() => Linking.openURL(`https://explorer.solana.com/address/${currentToken.address}`)}
          >
            <Text style={styles.addressValue}>
              {`${currentToken.address.substr(0, 6)}...${currentToken.address.substr(-4)}`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card.Content>
  </Card>

  {currentToken.description && (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.sectionTitle}>About</Title>
        <Divider style={styles.divider} />
        <Text style={styles.description}>{currentToken.description}</Text>
      </Card.Content>
    </Card>
  )}
</ScrollView>
); };

// Helper function to format numbers with commas const numberWithCommas = (x) => { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: theme.colors.background, }, loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background, }, errorText: { color: theme.colors.error, fontSize: 16, }, card: { margin: 16, marginBottom: 8, backgroundColor: theme.colors.surface, borderRadius: 12, }, chartCard: { margin: 16, marginTop: 8, marginBottom: 8, backgroundColor: theme.colors.surface, borderRadius: 12, paddingBottom: 16, }, tokenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', }, tokenInfo: { flex: 1, }, nameContainer: { flexDirection: 'row', alignItems: 'center', }, tokenSymbol: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginRight: 8, }, tokenName: { fontSize: 16, color: '#888', marginTop: 2, }, statusChip: { height: 26, }, newChip: { backgroundColor: '#FF9800', }, graduatingChip: { backgroundColor: theme.colors.primary, }, graduatedChip: { backgroundColor: theme.colors.positive, }, socialLinks: { flexDirection: 'row', alignItems: 'center', }, socialIcon: { margin: 0, }, priceSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, }, priceLabel: { fontSize: 14, color: '#888', }, price: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginVertical: 4, }, priceChange: { fontSize: 16, fontWeight: 'bold', }, tradeButton: { backgroundColor: theme.colors.primary, borderRadius: 8, }, timeframeSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, }, timeframeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, }, selectedTimeframeButton: { backgroundColor: theme.colors.primary, }, timeframeText: { color: '#888', fontWeight: 'bold', }, selectedTimeframeText: { color: theme.colors.text, }, chartLoadingContainer: { height: 220, justifyContent: 'center', alignItems: 'center', }, chart: { marginVertical: 8, borderRadius: 16, }, sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, }, divider: { backgroundColor: theme.colors.border, marginVertical: 12, }, statsContainer: { marginTop: 8, }, statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, }, statLabel: { fontSize: 14, color: '#888', }, statValue: { fontSize: 14, color: theme.colors.text, fontWeight: '500', }, addressValue: { fontSize: 14, color: theme.colors.primary, fontWeight: '500', }, description: { fontSize: 14, color: theme.colors.text, lineHeight: 20, }, });

export default TokenDetailScreen;

