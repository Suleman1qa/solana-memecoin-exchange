import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { theme } from '../theme';

const TokenListItem = ({ token, onPress }) => {
  const priceChangeColor = parseFloat(token.priceChange24h) >= 0
    ? theme.colors.positive
    : theme.colors.negative;

  const priceChangeSign = parseFloat(token.priceChange24h) >= 0 ? '+' : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContainer}>
        {token.logoURI ? (
          <Avatar.Image 
            size={40} 
            source={{ uri: token.logoURI }} 
            style={styles.logo} 
          />
        ) : (
          <Avatar.Text 
            size={40} 
            label={token.symbol.substring(0, 2)} 
            style={styles.logoPlaceholder} 
          />
        )}
        <View style={styles.tokenInfo}>
          <Text style={styles.symbol}>{token.symbol}</Text>
          <Text style={styles.name} numberOfLines={1}>{token.name}</Text>
        </View>
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.price}>${parseFloat(token.priceUSD).toFixed(8)}</Text>
        <Text style={[styles.priceChange, { color: priceChangeColor }]}>
          {priceChangeSign}{token.priceChange24h}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    backgroundColor: theme.colors.surface,
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
  rightContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TokenListItem;