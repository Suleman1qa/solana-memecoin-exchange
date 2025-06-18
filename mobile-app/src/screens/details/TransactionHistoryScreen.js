import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Title, Chip, ActivityIndicator, Divider, Menu, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionHistory } from '../../store/slices/walletSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const TransactionHistoryScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const dispatch = useDispatch();
  const { transactions, isLoading } = useSelector(state => state.wallet);

  useEffect(() => {
    loadTransactions();
  }, [walletId, statusFilter, typeFilter]);

  const loadTransactions = () => {
    dispatch(fetchTransactionHistory({
      walletId,
      status: statusFilter === 'ALL' ? null : statusFilter,
      type: typeFilter === 'ALL' ? null : typeFilter,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };
  
  const handleFilterByStatus = (status) => {
    setStatusFilter(status);
    setFilterMenuVisible(false);
  };
  
  const handleFilterByType = (type) => {
    setTypeFilter(type);
    setFilterMenuVisible(false);
  };
  
  const resetFilters = () => {
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setFilterMenuVisible(false);
  };
  
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'arrow-down';
      case 'WITHDRAWAL':
        return 'arrow-up';
      case 'SWAP':
        return 'swap-horizontal';
      case 'TRANSFER':
        return 'bank-transfer';
      case 'BUY':
        return 'shopping';
      case 'SELL':
        return 'cash';
      default:
        return 'circle';
    }
  };
  
  const getTransactionColor = (type, status) => {
    if (status === 'FAILED') return theme.colors.error;
    if (status === 'PENDING') return '#FF9800';
    
    switch (type) {
      case 'DEPOSIT':
      case 'BUY':
        return theme.colors.positive;
      case 'WITHDRAWAL':
      case 'SELL':
        return theme.colors.negative;
      case 'SWAP':
      case 'TRANSFER':
        return theme.colors.primary;
      default:
        return theme.colors.text;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return theme.colors.positive;
      case 'PENDING':
        return '#FF9800';
      case 'FAILED':
      case 'CANCELLED':
        return theme.colors.error;
      default:
        return '#888';
    }
  };
  
  const renderTransactionItem = ({ item }) => {
    const iconName = getTransactionIcon(item.type);
    const iconColor = getTransactionColor(item.type, item.status);
    const statusColor = getStatusColor(item.status);
    
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => navigation.navigate('TransactionDetail', { transaction: item })}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
        </View>
        
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <Text style={styles.transactionType}>{item.type}</Text>
            <Chip
              style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
              textStyle={{ color: statusColor, fontSize: 12 }}
            >
              {item.status}
            </Chip>
          </View>
          
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description || `${item.type} transaction`}
          </Text>
          
          <Text style={styles.transactionDate}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: iconColor }]}>
            {item.type === 'WITHDRAWAL' || item.type === 'SELL' ? '-' : '+'}{item.amountIn}
          </Text>
          <Text style={styles.tokenSymbol}>
            {item.tokenIn?.symbol || 'TOKEN'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Title style={styles.title}>Transaction History</Title>
        
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setFilterMenuVisible(true)}
          >
            <MaterialCommunityIcons name="filter-variant" size={20} color={theme.colors.primary} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
          
          {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={resetFilters}
            >
              <MaterialCommunityIcons name="close" size={16} color="#888" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : transactions.length > 0 ? (
        <FlatList
          data={transactions}
          renderItem={renderTransactionItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={64} color="#555" />
          <Text style={styles.emptyText}>No transactions found</Text>
          <Text style={styles.emptySubtext}>
            Your transaction history will appear here
          </Text>
        </View>
      )}
      
      <Menu
        visible={filterMenuVisible}
        onDismiss={() => setFilterMenuVisible(false)}
        anchor={{ x: 0, y: 0 }}
        style={styles.menu}
        contentStyle={styles.menuContent}
      >
        <Text style={styles.menuTitle}>Filter by Status</Text>
        <View style={styles.menuOptions}>
          {['ALL', 'COMPLETED', 'PENDING', 'FAILED', 'CANCELLED'].map(status => (
            <TouchableOpacity
              key={`status-${status}`}
              style={[
                styles.menuOption,
                statusFilter === status && styles.selectedMenuOption
              ]}
              onPress={() => handleFilterByStatus(status)}
            >
              <Text style={[
                styles.menuOptionText,
                statusFilter === status && styles.selectedMenuOptionText
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Divider style={styles.menuDivider} />
        
        <Text style={styles.menuTitle}>Filter by Type</Text>
        <View style={styles.menuOptions}>
          {['ALL', 'DEPOSIT', 'WITHDRAWAL', 'SWAP', 'TRANSFER', 'BUY', 'SELL'].map(type => (
            <TouchableOpacity
              key={`type-${type}`}
              style={[
                styles.menuOption,
                typeFilter === type && styles.selectedMenuOption
              ]}
              onPress={() => handleFilterByType(type)}
            >
              <Text style={[
                styles.menuOptionText,
                typeFilter === type && styles.selectedMenuOptionText
              ]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: 'bold',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#33333320',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  resetText: {
    color: '#888',
    marginLeft: 4,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  divider: {
    backgroundColor: theme.colors.border,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tokenSymbol: {
    fontSize: 12,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  menu: {
    width: '90%',
    alignSelf: 'center',
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
    padding: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  menuOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  menuOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#33333330',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedMenuOption: {
    backgroundColor: theme.colors.primary,
  },
  menuOptionText: {
    color: '#888',
  },
  selectedMenuOptionText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  menuDivider: {
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
});

export default TransactionHistoryScreen;