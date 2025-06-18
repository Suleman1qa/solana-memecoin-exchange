import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Title, Chip, ActivityIndicator, Divider, Menu, IconButton, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders, cancelOrder } from '../../store/slices/marketSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const OrderHistoryScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const dispatch = useDispatch();
  const { userOrders, ordersPagination, isLoading } = useSelector(state => state.market);

  useEffect(() => {
    loadOrders(true);
  }, [statusFilter, typeFilter]);

  const loadOrders = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    
    if (reset) {
      setPage(1);
    }
    
    const params = {
      page: currentPage,
      limit: 20,
    };
    
    if (statusFilter !== 'ALL') {
      params.status = statusFilter;
    }
    
    if (typeFilter !== 'ALL') {
      params.type = typeFilter;
    }
    
    dispatch(fetchUserOrders(params));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders(true);
    setRefreshing(false);
  };

  const loadMoreOrders = async () => {
    if (page < ordersPagination.pages && !loadingMore && !isLoading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      
      const params = {
        page: nextPage,
        limit: 20,
      };
      
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      
      if (typeFilter !== 'ALL') {
        params.type = typeFilter;
      }
      
      await dispatch(fetchUserOrders(params));
      setLoadingMore(false);
    }
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
  
  const handleCancelOrder = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId));
      // Refresh orders after cancellation
      loadOrders(true);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };
  
  const getOrderIcon = (type, side) => {
    if (side === 'BUY') {
      return 'arrow-up-bold';
    } else {
      return 'arrow-down-bold';
    }
  };
  
  const getOrderColor = (side, status) => {
    if (status === 'CANCELLED' || status === 'REJECTED') {
      return '#666';
    }
    
    return side === 'BUY' ? theme.colors.positive : theme.colors.negative;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'FILLED':
        return theme.colors.positive;
      case 'PARTIALLY_FILLED':
        return '#FF9800';
      case 'OPEN':
        return theme.colors.primary;
      case 'CANCELLED':
      case 'REJECTED':
        return theme.colors.error;
      default:
        return '#888';
    }
  };
  
  const canCancelOrder = (order) => {
    return ['OPEN', 'PARTIALLY_FILLED'].includes(order.status);
  };

  const renderOrderItem = ({ item }) => {
    const iconName = getOrderIcon(item.type, item.side);
    const orderColor = getOrderColor(item.side, item.status);
    const statusColor = getStatusColor(item.status);
    const fillPercentage = ((parseFloat(item.filled) / parseFloat(item.amount)) * 100).toFixed(1);
    
    return (
      <Card style={styles.orderCard}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <View style={styles.orderTitleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: orderColor + '20' }]}>
                <MaterialCommunityIcons name={iconName} size={20} color={orderColor} />
              </View>
              
              <View style={styles.orderInfo}>
                <View style={styles.orderTitleRow}>
                  <Text style={styles.orderType}>{item.side} {item.pair}</Text>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}
                    textStyle={{ color: statusColor, fontSize: 12 }}
                  >
                    {item.status}
                  </Chip>
                </View>
                <Text style={styles.orderSubtitle}>
                  {item.type} Order • {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>
            </View>
            
            {canCancelOrder(item) && (
              <IconButton
                icon="close"
                size={20}
                onPress={() => handleCancelOrder(item._id)}
                style={styles.cancelButton}
              />
            )}
          </View>
          
          <Divider style={styles.orderDivider} />
          
          <View style={styles.orderDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>
                {item.price ? `$${parseFloat(item.price).toFixed(6)}` : 'Market Price'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {parseFloat(item.amount).toFixed(4)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Filled</Text>
              <Text style={styles.detailValue}>
                {parseFloat(item.filled).toFixed(4)} ({fillPercentage}%)
              </Text>
            </View>
            
            {item.status === 'FILLED' && item.price && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total</Text>
                <Text style={[styles.detailValue, styles.totalValue]}>
                  ${(parseFloat(item.filled) * parseFloat(item.price)).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
          
          {item.status === 'PARTIALLY_FILLED' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${fillPercentage}%`,
                      backgroundColor: orderColor
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{fillPercentage}% filled</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading more orders...</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Title style={styles.title}>Order History</Title>
        
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
      
      {isLoading && !refreshing && userOrders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : userOrders.length > 0 ? (
        <FlatList
          data={userOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreOrders}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="clipboard-list" size={64} color="#555" />
          <Text style={styles.emptyText}>No orders found</Text>
          <Text style={styles.emptySubtext}>
            Your trading orders will appear here
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Market')}
            style={styles.exploreButton}
          >
            Explore Market
          </Button>
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
          {['ALL', 'OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED'].map(status => (
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
                {status.replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Divider style={styles.menuDivider} />
        
        <Text style={styles.menuTitle}>Filter by Type</Text>
        <View style={styles.menuOptions}>
          {['ALL', 'MARKET', 'LIMIT', 'STOP_LIMIT', 'STOP_MARKET'].map(type => (
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
                {type.replace('_', ' ')}
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
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginRight: 8,
    flex: 1,
  },
  statusChip: {
    height: 24,
  },
  orderSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  cancelButton: {
    margin: 0,
    backgroundColor: theme.colors.error + '20',
  },
  orderDivider: {
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  orderDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  totalValue: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
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
    marginBottom: 20,
  },
  exploreButton: {
    borderColor: theme.colors.primary,
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
    fontSize: 12,
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

export default OrderHistoryScreen;
