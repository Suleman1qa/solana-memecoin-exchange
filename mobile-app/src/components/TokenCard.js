import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Title, Text, Avatar } from 'react-native-paper';
import { theme } from '../theme.js';
const TokenCard = ({ token, onPress }) => {
  const priceChangeColor = parseFloat(token.priceChange24h) >= 0
    ? theme.colors.positive
    : theme.colors.negative;

  const priceChangeSign = parseFloat(token.priceChange24h) >= 0 ? '+' : '';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.tokenHeader}>
            {token.logoURI ? (
              <Avatar.Image 
                size={36} 
                source={{ uri: token.logoURI }} 
                style={styles.logo} 
              />
            ) : (
              <Avatar.Text 
                size={36} 
                label={token.symbol.substring(0, 2)} 
                style={styles.logoPlaceholder} 
              />
            )}
            <View style={styles.tokenInfo}>
              <Title style={styles.symbol}>{token.symbol}</Title>
              <Text style={styles.name} numberOfLines={1}>{token.name}</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${parseFloat(token.priceUSD).toFixed(8)}</Text>
            <Text style={[styles.priceChange, { color: priceChangeColor }]}>
              {priceChangeSign}{token.priceChange24h}%
            </Text>
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Volume 24h</Text>
              <Text style={styles.statValue}>
                ${numberWithCommas(parseFloat(token.volume24h).toFixed(2))}
              </Text>
            </View>
            {token.marketCapUSD && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Market Cap</Text>
                <Text style={styles.statValue}>
                  ${numberWithCommas(parseFloat(token.marketCapUSD).toFixed(2))}
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

// Helper function to format numbers with commas
const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const styles = StyleSheet.create({
  card: {
    width: 220,
    marginRight: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 3,
  },
  cardContent: {
    padding: 12,
  },
  tokenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    backgroundColor: theme.colors.background,
  },
  logoPlaceholder: {
    backgroundColor: theme.colors.primary,
  },
  tokenInfo: {
    marginLeft: 12,
    flex: 1,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    color: '#888',
  },
  priceContainer: {
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default TokenCard;