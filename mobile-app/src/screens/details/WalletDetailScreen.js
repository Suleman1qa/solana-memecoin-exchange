import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from "react-native";
import {
  Text,
  Card,
  Title,
  Button,
  Divider,
  ActivityIndicator,
  IconButton,
  Menu,
  Portal,
  Dialog,
  TextInput,
} from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWalletDetails,
  updateWallet,
  clearError,
  clearSuccess,
} from "../../store/slices/walletSlice.js";
import { theme } from "../../theme.js";
import { useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";

const WalletDetailScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const dispatch = useDispatch();
  const { currentWallet, isLoading, error, operationSuccess } = useSelector(
    (state) => state.wallet
  );

  useFocusEffect(
    useCallback(() => {
      loadWalletDetails();
    }, [walletId])
  );

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    if (operationSuccess) {
      setSnackbarMessage("Wallet updated successfully");
      setSnackbarVisible(true);
      dispatch(clearSuccess());
      setEditDialogVisible(false);
    }
  }, [operationSuccess]);

  const loadWalletDetails = () => {
    dispatch(fetchWalletDetails(walletId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletDetails();
    setRefreshing(false);
  };

  const copyAddressToClipboard = () => {
    if (currentWallet?.address) {
      Clipboard.setStringAsync(currentWallet.address);
      setSnackbarMessage("Address copied to clipboard");
      setSnackbarVisible(true);
    }
  };

  const openInExplorer = () => {
    if (currentWallet?.address) {
      Linking.openURL(
        `https://explorer.solana.com/address/${currentWallet.address}`
      );
    }
  };

  const handleEditWallet = () => {
    setNewLabel(currentWallet?.label || "");
    setEditDialogVisible(true);
    setMenuVisible(false);
  };

  const saveWalletLabel = () => {
    if (newLabel.trim() && walletId) {
      dispatch(updateWallet({ walletId, label: newLabel.trim() }));
    }
  };

  const getTotalBalance = () => {
    if (!currentWallet || !currentWallet.balances) {
      return "0.00";
    }

    let total = 0;
    currentWallet.balances.forEach((balance) => {
      const tokenPrice = parseFloat(balance.token?.priceUSD || 0);
      const amount = parseFloat(balance.amount);
      total += amount * tokenPrice;
    });

    return total.toFixed(2);
  };

  const renderTokenBalance = (balance) => (
    <TouchableOpacity
      key={balance.token._id}
      style={styles.tokenItem}
      onPress={() =>
        navigation.navigate("TokenDetail", {
          tokenAddress: balance.token.address,
        })
      }
    >
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{balance.token.symbol}</Text>
        <Text style={styles.tokenName}>{balance.token.name}</Text>
      </View>

      <View style={styles.tokenAmount}>
        <Text style={styles.balanceAmount}>
          {parseFloat(balance.amount).toFixed(6)}
        </Text>
        <Text style={styles.balanceValue}>
          $
          {(
            parseFloat(balance.amount) * parseFloat(balance.token.priceUSD || 0)
          ).toFixed(2)}
        </Text>
        {parseFloat(balance.locked) > 0 && (
          <Text style={styles.lockedAmount}>
            Locked: {parseFloat(balance.locked).toFixed(6)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing && !currentWallet) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!currentWallet) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Wallet not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Card style={styles.walletCard}>
          <Card.Content>
            <View style={styles.walletHeader}>
              <View style={styles.walletInfo}>
                <Title style={styles.walletLabel}>{currentWallet.label}</Title>
                <Text style={styles.walletType}>
                  {currentWallet.type} Wallet
                </Text>
              </View>

              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    color={theme.colors.text}
                    onPress={() => setMenuVisible(true)}
                  />
                }
              >
                <Menu.Item onPress={handleEditWallet} title="Edit Label" />
                <Menu.Item onPress={openInExplorer} title="View in Explorer" />
              </Menu>
            </View>

            <View style={styles.addressSection}>
              <Text style={styles.addressLabel}>Wallet Address</Text>
              <TouchableOpacity
                style={styles.addressContainer}
                onPress={copyAddressToClipboard}
              >
                <Text style={styles.addressText}>{currentWallet.address}</Text>
                <MaterialCommunityIcons
                  name="content-copy"
                  size={20}
                  color={theme.colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.balanceSection}>
              <Text style={styles.totalBalanceLabel}>Total Balance</Text>
              <Text style={styles.totalBalanceAmount}>
                ${getTotalBalance()}
              </Text>
            </View>

            <View style={styles.actionsRow}>
              <Button
                mode="contained"
                style={styles.actionButton}
                onPress={() => navigation.navigate("Deposit", { walletId })}
              >
                Deposit
              </Button>
              <Button
                mode="outlined"
                style={styles.actionButton}
                onPress={() => navigation.navigate("Withdraw", { walletId })}
              >
                Withdraw
              </Button>
              <Button
                mode="outlined"
                style={styles.actionButton}
                onPress={() => navigation.navigate("Transfer", { walletId })}
              >
                Transfer
              </Button>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.assetsCard}>
          <Card.Content>
            <View style={styles.assetsHeader}>
              <Title style={styles.assetsTitle}>Assets</Title>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("TransactionHistory", { walletId })
                }
              >
                <Text style={styles.historyLink}>View History</Text>
              </TouchableOpacity>
            </View>

            <Divider style={styles.divider} />

            {currentWallet.balances && currentWallet.balances.length > 0 ? (
              currentWallet.balances
                .filter((balance) => parseFloat(balance.amount) > 0)
                .map(renderTokenBalance)
            ) : (
              <View style={styles.emptyAssets}>
                <MaterialCommunityIcons
                  name="wallet-outline"
                  size={64}
                  color="#555"
                />
                <Text style={styles.emptyText}>No assets in this wallet</Text>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate("Deposit", { walletId })}
                  style={styles.depositButton}
                >
                  Deposit Funds
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            Edit Wallet Label
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Wallet Label"
              value={newLabel}
              onChangeText={setNewLabel}
              mode="outlined"
              style={styles.dialogInput}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveWalletLabel} disabled={!newLabel.trim()}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.error,
    marginBottom: 20,
  },
  walletCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  walletType: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: "monospace",
    marginRight: 8,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  totalBalanceLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  totalBalanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  assetsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  assetsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  assetsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  historyLink: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  divider: {
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  tokenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tokenInfo: {
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  tokenName: {
    fontSize: 12,
    color: "#888",
  },
  tokenAmount: {
    alignItems: "flex-end",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: 14,
    color: "#888",
  },
  lockedAmount: {
    fontSize: 12,
    color: "#FF9800",
    marginTop: 2,
  },
  emptyAssets: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 16,
    marginBottom: 20,
  },
  depositButton: {
    borderColor: theme.colors.primary,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogInput: {
    backgroundColor: "transparent",
  },
});

export default WalletDetailScreen;
