import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Card, Title, Button, FAB, ActivityIndicator, Divider, IconButton, Menu, Portal, Dialog, TextInput } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallets, fetchWalletDetails, createWallet, setCurrentWallet, clearError } from '../../store/slices/walletSlice.js';
import { theme } from '../../theme.js';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const WalletScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  
  const dispatch = useDispatch();
  const { wallets, currentWallet, isLoading, error } = useSelector(state => state.wallet);

  useFocusEffect(
    useCallback(() => {
      loadWallets();
    }, [])
  );

  useEffect(() => {
    if (currentWallet) {
      dispatch(fetchWalletDetails(currentWallet._id));
    }
  }, [currentWallet?._id]);

  const loadWallets = async () => {
    dispatch(fetchWallets());
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWallets();
    if (currentWallet) {
      await dispatch(fetchWalletDetails(currentWallet._id));
    }
    setRefreshing(false);
  };

  const handleWalletSelect = (wallet) => {
    dispatch(setCurrentWallet(wallet));
    setMenuVisible(false);
  };

  const handleCreateWallet = () => {
    if (newWalletName.trim() === '') {
      return;
    }
    
    dispatch(createWallet({ type: 'FUNDING', label: newWalletName.trim() }));
    setNewWalletName('');
    setDialogVisible(false);
  };

  const navigateToWalletDetail = () => {
    if (currentWallet) {
      navigation.navigate('WalletDetail', { walletId: currentWallet._id });
    }
  };

  const navigateToDeposit = () => {
    if (currentWallet) {
      navigation.navigate('Deposit', { walletId: currentWallet._id });
    }
    setFabOpen(false);
  };

  const navigateToWithdraw = () => {
    if (currentWallet) {
      navigation.navigate('Withdraw', { walletId: currentWallet._id });
    }
    setFabOpen(false);
  };

  const navigateToSwap = () => {
    if (currentWallet) {
      navigation.navigate('Swap', { walletId: currentWallet._id });
    }
    setFabOpen(false);
  };

  const navigateToTransfer = () => {
    if (currentWallet) {
      navigation.navigate('Transfer', { walletId: currentWallet._id });
    }
    setFabOpen(false);
  };

  const navigateToTransactionHistory = () => {
    if (currentWallet) {
      navigation.navigate('TransactionHistory', { walletId: currentWallet._id });
    }
  };

  const renderTokenItem = ({ item }) => {
    // Calculate USD value
    const tokenValue = parseFloat(item.amount) * parseFloat(item.token?.priceUSD || 0);
    
    return (
      <TouchableOpacity 
        style={styles.tokenItem}
        onPress={() => navigation.navigate('TokenDetail', { tokenAddress: item.token.address })}
      >
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenSymbol}>{item.token.symbol}</Text>
          <Text style={styles.tokenName}>{item.token.name}</Text>
        </View>
        
        <View style={styles.tokenBalance}>
          <Text style={styles.balanceAmount}>{parseFloat(item.amount).toFixed(4)}</Text>
          <Text style={styles.balanceValue}>${tokenValue.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTotalBalance = () => {
    if (!currentWallet || !currentWallet.balances) {
      return '0.00';
    }
    
    let total = 0;
    
    currentWallet.balances.forEach(balance => {
      const tokenPrice = parseFloat(balance.token?.priceUSD || 0);
      const amount = parseFloat(balance.amount);
      total += amount * tokenPrice;
    });
    
    return total.toFixed(2);
  };

  if (isLoading && !refreshing && !currentWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.walletSelector}>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.walletDropdown}
                  onPress={() => setMenuVisible(true)}
                >
                  <Text style={styles.walletName}>
                    {currentWallet?.label || 'Select Wallet'}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              }
            >
              {wallets.map(wallet => (
                <Menu.Item
                  key={wallet._id}
                  onPress={() => handleWalletSelect(wallet)}
                  title={wallet.label}
                />
              ))}
              <Divider />
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  setDialogVisible(true);
                }}
                title="+ Create New Wallet"
              />
            </Menu>
          </View>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceTotal}>${getTotalBalance()}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToDeposit}
            >
              <IconButton
                icon="arrow-down"
                color={theme.colors.text}
                size={24}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Deposit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToWithdraw}
            >
              <IconButton
                icon="arrow-up"
                color={theme.colors.text}
                size={24}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Withdraw</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToSwap}
            >
              <IconButton
                icon="swap-horizontal"
                color={theme.colors.text}
                size={24}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Swap</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToTransfer}
            >
              <IconButton
                icon="bank-transfer"
                color={theme.colors.text}
                size={24}
                style={styles.actionIcon}
              />
              <Text style={styles.actionText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.assetsHeader}>
        <Text style={styles.assetsTitle}>Assets</Text>
        <TouchableOpacity onPress={navigateToTransactionHistory}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      {currentWallet && currentWallet.balances && currentWallet.balances.length > 0 ? (
        <FlatList
          data={currentWallet.balances.filter(b => parseFloat(b.amount) > 0)}
          renderItem={renderTokenItem}
          keyExtractor={(item) => item.token._id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assets in this wallet</Text>
              <Button
                mode="outlined"
                onPress={navigateToDeposit}
                style={styles.depositButton}
              >
                Deposit Funds
              </Button>
            </View>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No assets in this wallet</Text>
          <Button
            mode="outlined"
            onPress={navigateToDeposit}
            style={styles.depositButton}
          >
            Deposit Funds
          </Button>
        </View>
      )}

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>Create New Wallet</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Wallet Name"
              value={newWalletName}
              onChangeText={setNewWalletName}
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreateWallet}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB.Group
        open={fabOpen}
        visible
        icon={fabOpen ? 'close' : 'plus'}
        color={theme.colors.text}
        fabStyle={styles.fab}
        actions={[
          {
            icon: 'bank-transfer',
            label: 'Transfer',
            onPress: navigateToTransfer,
            color: theme.colors.primary,
          },
          {
            icon: 'swap-horizontal',
            label: 'Swap',
            onPress: navigateToSwap,
            color: theme.colors.primary,
          },
          {
            icon: 'arrow-up',
            label: 'Withdraw',
            onPress: navigateToWithdraw,
            color: theme.colors.primary,
          },
          {
            icon: 'arrow-down',
            label: 'Deposit',
            onPress: navigateToDeposit,
            color: theme.colors.primary,
          },
        ]}
        onStateChange={({ open }) => setFabOpen(open)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    elevation: 4,
  },
  walletSelector: {
    marginBottom: 16,
  },
  walletDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginRight: 4,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  balanceTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    backgroundColor: '#333',
    margin: 0,
  },
  actionText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.text,
  },
  assetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  historyText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  tokenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 14,
    color: '#888',
  },
  tokenBalance: {
    alignItems: 'flex-end',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    color: '#888',
  },
  divider: {
    backgroundColor: theme.colors.border,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  depositButton: {
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  fab: {
    backgroundColor: theme.colors.primary,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogInput: {
    backgroundColor: 'transparent',
  },
});

export default WalletScreen;
