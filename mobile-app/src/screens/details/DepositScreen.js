import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Clipboard, Linking, Image } from 'react-native';
import { Text, Card, Title, Button, Divider, Snackbar, ActivityIndicator, Menu } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWalletDetails } from '../../store/slices/walletSlice';
import { theme } from '../../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DepositScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [selectedToken, setSelectedToken] = useState(null);
  const [tokenMenuVisible, setTokenMenuVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const { currentWallet, isLoading } = useSelector(state => state.wallet);

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

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setTokenMenuVisible(false);
  };
  
  const copyAddressToClipboard = () => {
    if (currentWallet && currentWallet.address) {
      Clipboard.setString(currentWallet.address);
      setSnackbarMessage('Address copied to clipboard');
      setSnackbarVisible(true);
    }
  };
  
  const openExplorer = () => {
    if (currentWallet && currentWallet.address) {
      Linking.openURL(`https://explorer.solana.com/address/${currentWallet.address}`);
    }
  };
  
  if (isLoading || !currentWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Deposit Funds</Title>
          
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
          </View>
          
          <Divider style={styles.divider} />
          
          {selectedToken && (
            <>
              <View style={styles.addressContainer}>
                <Text style={styles.label}>Your Deposit Address</Text>
                <TouchableOpacity 
                  style={styles.addressBox}
                  onPress={copyAddressToClipboard}
                >
                  <Text style={styles.addressText}>{currentWallet.address}</Text>
                  <MaterialCommunityIcons name="content-copy" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
                <Text style={styles.addressNote}>
                  Send only {selectedToken.symbol} to this address
                </Text>
              </View>
              
              <View style={styles.qrCodeContainer}>
                <QRCode
                  value={currentWallet.address}
                  size={200}
                  color="#fff"
                  backgroundColor="transparent"
                />
              </View>
              
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Important Information:</Text>
                <Text style={styles.infoText}>
                  • Send only {selectedToken.symbol} to this address
                </Text>
                <Text style={styles.infoText}>
                  • Minimum deposit: 0.00001 {selectedToken.symbol}
                </Text>
                <Text style={styles.infoText}>
                  • Deposits will be credited after {selectedToken.symbol === 'SOL' ? '32' : '15'} network confirmations
                </Text>
                <Text style={styles.infoText}>
                  • Sending any other asset to this address may result in permanent loss
                </Text>
              </View>
              
              <Button
                mode="outlined"
                onPress={openExplorer}
                style={styles.explorerButton}
              >
                View on Explorer
              </Button>
            </>
          )}
        </Card.Content>
      </Card>
      
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
          {currentWallet.balances.map(balance => (
            <TouchableOpacity
              key={balance.token._id}
              style={styles.tokenItem}
              onPress={() => handleTokenSelect(balance.token)}
            >
              <Text style={styles.tokenSymbol}>{balance.token.symbol}</Text>
              <Text style={styles.tokenName}>{balance.token.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Menu>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
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
    padding: 16,
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
    marginBottom: 16,
    color: theme.colors.text,
  },
  tokenSelector: {
    marginBottom: 16,
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
  divider: {
    backgroundColor: theme.colors.border,
    marginVertical: 16,
  },
  addressContainer: {
    marginBottom: 24,
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginRight: 8,
  },
  addressNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  explorerButton: {
    borderColor: theme.colors.primary,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
});

export default DepositScreen;