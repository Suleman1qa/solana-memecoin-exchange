import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Title, Divider, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWallets } from '../../store/slices/walletSlice.js';
import { fetchUserOrders } from '../../store/slices/marketSlice.js';
import { logout } from '../../store/slices/authSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState('0.00');
  
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { wallets } = useSelector(state => state.wallet);
  const { userOrders } = useSelector(state => state.market);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    calculatePortfolioValue();
  }, [wallets]);

  const loadProfileData = async () => {
    dispatch(fetchWallets());
    dispatch(fetchUserOrders({ limit: 5 }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  };

  const calculatePortfolioValue = () => {
    if (!wallets || wallets.length === 0) {
      setPortfolioValue('0.00');
      return;
    }

    let total = 0;
    wallets.forEach(wallet => {
      if (wallet.balances) {
        wallet.balances.forEach(balance => {
          const tokenPrice = parseFloat(balance.token?.priceUSD || 0);
          const amount = parseFloat(balance.amount || 0);
          total += amount * tokenPrice;
        });
      }
    });

    setPortfolioValue(total.toFixed(2));
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  const getActiveOrdersCount = () => {
    return userOrders.filter(order => 
      ['OPEN', 'PARTIALLY_FILLED'].includes(order.status)
    ).length;
  };

  const getCompletedOrdersCount = () => {
    return userOrders.filter(order => order.status === 'FILLED').length;
  };

  const profileMenuItems = [
    {
      title: 'Wallet Management',
      subtitle: `${wallets.length} wallet${wallets.length !== 1 ? 's' : ''}`,
      icon: 'wallet',
      onPress: () => navigation.navigate('Wallet'),
      showChevron: true
    },
    {
      title: 'Transaction History',
      subtitle: 'View all transactions',
      icon: 'history',
      onPress: () => navigation.navigate('TransactionHistory'),
      showChevron: true
    },
    {
      title: 'Order History',
      subtitle: `${getActiveOrdersCount()} active, ${getCompletedOrdersCount()} completed`,
      icon: 'clipboard-list',
      onPress: () => navigation.navigate('OrderHistory'),
      showChevron: true
    },
    {
      title: 'Settings',
      subtitle: 'Account and app settings',
      icon: 'cog',
      onPress: () => navigation.navigate('Settings'),
      showChevron: true
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle',
      onPress: () => navigation.navigate('Help'),
      showChevron: true
    }
  ];

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
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.avatarSection}>
              {user?.profilePicture ? (
                <Avatar.Image size={80} source={{ uri: user.profilePicture }} />
              ) : (
                <Avatar.Text 
                  size={80} 
                  label={getInitials(user?.fullName || user?.username)} 
                  style={styles.avatar}
                />
              )}
              
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={() => navigation.navigate('Settings')}
              >
                <MaterialCommunityIcons name="camera" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>
                {user?.fullName || user?.username || 'User'}
              </Title>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.memberSince}>
                Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
              </Text>
              
              {user?.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color={theme.colors.positive} />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Portfolio Overview */}
      <Card style={styles.portfolioCard}>
        <Card.Content>
          <View style={styles.portfolioHeader}>
            <Title style={styles.portfolioTitle}>Portfolio Value</Title>
            <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.portfolioValue}>${portfolioValue}</Text>
          
          <View style={styles.portfolioStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wallets.length}</Text>
              <Text style={styles.statLabel}>Wallets</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getActiveOrdersCount()}</Text>
              <Text style={styles.statLabel}>Active Orders</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{getCompletedOrdersCount()}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.quickActionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Quick Actions</Title>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Market')}
            >
              <MaterialCommunityIcons name="chart-line" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Trade</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Swap')}
            >
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Swap</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Deposit')}
            >
              <MaterialCommunityIcons name="arrow-down" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Deposit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Withdraw')}
            >
              <MaterialCommunityIcons name="arrow-up" size={24} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Menu Items */}
      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuContent}>
          {profileMenuItems.map((item, index) => (
            <View key={item.title}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={24} 
                      color={theme.colors.primary} 
                    />
                  </View>
                  
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                
                {item.showChevron && (
                  <MaterialCommunityIcons 
                    name="chevron-right" 
                    size={20} 
                    color="#888" 
                  />
                )}
              </TouchableOpacity>
              
              {index < profileMenuItems.length - 1 && (
                <Divider style={styles.menuDivider} />
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={() => dispatch(logout())}
          style={styles.logoutButton}
          textColor={theme.colors.error}
        >
          <MaterialCommunityIcons name="logout" size={16} />
          {' '}Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: 4,
    fontSize: 12,
    color: theme.colors.positive,
    fontWeight: 'bold',
  },
  portfolioCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  portfolioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portfolioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  viewAllText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
    marginHorizontal: 16,
  },
  quickActionsCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  menuContent: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  menuDivider: {
    backgroundColor: theme.colors.border,
    marginLeft: 68,
  },
  logoutContainer: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});

export default ProfileScreen;
