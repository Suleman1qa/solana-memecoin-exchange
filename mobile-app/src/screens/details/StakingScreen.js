import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Card, Title, Button, TextInput, Chip, ActivityIndicator, Snackbar, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStakingPools, stake, unstake, claimRewards, fetchUserStakes } from '../../store/slices/stakingSlice.js';
import { fetchWalletDetails } from '../../store/slices/walletSlice.js';
import { theme } from '../../theme.js';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const StakingScreen = ({ route, navigation }) => {
  const { walletId } = route.params;
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeTab, setActiveTab] = useState('stake'); // 'stake', 'unstake', 'rewards'
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const dispatch = useDispatch();
  const { 
    stakingPools, 
    userStakes, 
    isLoading, 
    error, 
    operationSuccess 
  } = useSelector(state => state.staking);
  const { currentWallet } = useSelector(state => state.wallet);

  useEffect(() => {
    loadData();
  }, [walletId]);

  useEffect(() => {
    if (operationSuccess) {
      setSnackbarMessage('Operation completed successfully');
      setSnackbarVisible(true);
      setStakeAmount('');
      setUnstakeAmount('');
      loadData();
    }
  }, [operationSuccess]);

  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarVisible(true);
    }
  }, [error]);

  const loadData = async () => {
    if (walletId) {
      dispatch(fetchWalletDetails(walletId));
    }
    dispatch(fetchStakingPools());
    dispatch(fetchUserStakes(walletId));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount || parseFloat(stakeAmount) <= 0) {
      setSnackbarMessage('Please select a pool and enter a valid amount');
      setSnackbarVisible(true);
      return;
    }

    dispatch(stake({
      walletId,
      poolId: selectedPool._id,
      amount: stakeAmount
    }));
  };

  const handleUnstake = async () => {
    if (!selectedPool || !unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      setSnackbarMessage('Please select a pool and enter a valid amount');
      setSnackbarVisible(true);
      return;
    }

    dispatch(unstake({
      walletId,
      poolId: selectedPool._id,
      amount: unstakeAmount
    }));
  };

  const handleClaimRewards = async (stakeId) => {
    dispatch(claimRewards({
      walletId,
      stakeId
    }));
  };

  const getWalletBalance = (tokenSymbol) => {
    if (!currentWallet || !currentWallet.balances) return '0';
    
    const balance = currentWallet.balances.find(b => b.token.symbol === tokenSymbol);
    return balance ? balance.amount : '0';
  };

  const getUserStakeInPool = (poolId) => {
    return userStakes.find(stake => stake.poolId === poolId);
  };

  const calculateRewards = (stake) => {
    const now = new Date();
    const stakeDate = new Date(stake.createdAt);
    const daysStaked = (now - stakeDate) / (1000 * 60 * 60 * 24);
    const dailyRate = parseFloat(stake.pool.apr) / 365 / 100;
    return parseFloat(stake.amount) * dailyRate * daysStaked;
  };

  const renderStakingPoolCard = (pool) => {
    const userStake = getUserStakeInPool(pool._id);
    const hasStake = userStake && parseFloat(userStake.amount) > 0;
    
    return (
      <TouchableOpacity
        key={pool._id}
        onPress={() => setSelectedPool(pool)}
        style={[
          styles.poolCard,
          selectedPool?._id === pool._id && styles.selectedPoolCard
        ]}
      >
        <View style={styles.poolHeader}>
          <View style={styles.poolInfo}>
            <Text style={styles.poolTitle}>Stake {pool.stakeToken.symbol}</Text>
            <Text style={styles.poolSubtitle}>Earn {pool.rewardToken.symbol}</Text>
          </View>
          <View style={styles.aprContainer}>
            <Text style={styles.aprValue}>{pool.apr}%</Text>
            <Text style={styles.aprLabel}>APR</Text>
          </View>
        </View>
        
        <Divider style={styles.poolDivider} />
        
        <View style={styles.poolStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Staked</Text>
            <Text style={styles.statValue}>
              {parseFloat(pool.totalStaked).toFixed(2)} {pool.stakeToken.symbol}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Lock Period</Text>
            <Text style={styles.statValue}>{pool.lockPeriodDays} days</Text>
          </View>
          
          {hasStake && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Stake</Text>
              <Text style={styles.statValue}>
                {parseFloat(userStake.amount).toFixed(4)} {pool.stakeToken.symbol}
              </Text>
            </View>
          )}
        </View>
        
        {hasStake && (
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsLabel}>Pending Rewards</Text>
            <Text style={styles.rewardsValue}>
              {calculateRewards(userStake).toFixed(6)} {pool.rewardToken.symbol}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStakeTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Stake Tokens</Text>
      
      {selectedPool ? (
        <Card style={styles.actionCard}>
          <Card.Content>
            <View style={styles.selectedPoolInfo}>
              <Text style={styles.selectedPoolTitle}>
                Stake {selectedPool.stakeToken.symbol} → Earn {selectedPool.rewardToken.symbol}
              </Text>
              <Text style={styles.selectedPoolApr}>{selectedPool.apr}% APR</Text>
            </View>
            
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance:</Text>
              <Text style={styles.balanceValue}>
                {parseFloat(getWalletBalance(selectedPool.stakeToken.symbol)).toFixed(4)} {selectedPool.stakeToken.symbol}
              </Text>
            </View>
            
            <TextInput
              label={`Amount to stake (${selectedPool.stakeToken.symbol})`}
              value={stakeAmount}
              onChangeText={setStakeAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
            
            <View style={styles.percentageButtons}>
              {[0.25, 0.5, 0.75, 1].map(percentage => (
                <TouchableOpacity
                  key={percentage}
                  style={styles.percentageButton}
                  onPress={() => {
                    const balance = getWalletBalance(selectedPool.stakeToken.symbol);
                    const amount = (parseFloat(balance) * percentage).toFixed(6);
                    setStakeAmount(amount);
                  }}
                >
                  <Text style={styles.percentageText}>{percentage * 100}%</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              mode="contained"
              onPress={handleStake}
              style={styles.actionButton}
              disabled={isLoading || !stakeAmount || parseFloat(stakeAmount) <= 0}
              loading={isLoading}
            >
              Stake {selectedPool.stakeToken.symbol}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Text style={styles.selectPoolText}>Select a staking pool to continue</Text>
      )}
    </View>
  );

  const renderUnstakeTab = () => {
    const userStake = selectedPool ? getUserStakeInPool(selectedPool._id) : null;
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Unstake Tokens</Text>
        
        {selectedPool && userStake ? (
          <Card style={styles.actionCard}>
            <Card.Content>
              <View style={styles.selectedPoolInfo}>
                <Text style={styles.selectedPoolTitle}>
                  Unstake {selectedPool.stakeToken.symbol}
                </Text>
              </View>
              
              <View style={styles.stakeInfo}>
                <Text style={styles.stakeLabel}>Your Staked Amount:</Text>
                <Text style={styles.stakeValue}>
                  {parseFloat(userStake.amount).toFixed(4)} {selectedPool.stakeToken.symbol}
                </Text>
              </View>
              
              <View style={styles.lockInfo}>
                <Text style={styles.lockLabel}>Lock Status:</Text>
                <Chip
                  style={[
                    styles.lockChip,
                    userStake.isLocked ? styles.lockedChip : styles.unlockedChip
                  ]}
                >
                  {userStake.isLocked ? 'Locked' : 'Unlocked'}
                </Chip>
              </View>
              
              {userStake.isLocked && (
                <Text style={styles.lockWarning}>
                  Your tokens are locked until {new Date(userStake.unlockDate).toLocaleDateString()}
                </Text>
              )}
              
              <TextInput
                label={`Amount to unstake (${selectedPool.stakeToken.symbol})`}
                value={unstakeAmount}
                onChangeText={setUnstakeAmount}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                theme={{ colors: { primary: theme.colors.primary } }}
                disabled={userStake.isLocked}
              />
              
              <View style={styles.percentageButtons}>
                {[0.25, 0.5, 0.75, 1].map(percentage => (
                  <TouchableOpacity
                    key={percentage}
                    style={[
                      styles.percentageButton,
                      userStake.isLocked && styles.disabledButton
                    ]}
                    onPress={() => {
                      if (!userStake.isLocked) {
                        const amount = (parseFloat(userStake.amount) * percentage).toFixed(6);
                        setUnstakeAmount(amount);
                      }
                    }}
                    disabled={userStake.isLocked}
                  >
                    <Text style={styles.percentageText}>{percentage * 100}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Button
                mode="contained"
                onPress={handleUnstake}
                style={styles.actionButton}
                disabled={
                  isLoading || 
                  !unstakeAmount || 
                  parseFloat(unstakeAmount) <= 0 || 
                  userStake.isLocked
                }
                loading={isLoading}
              >
                Unstake {selectedPool.stakeToken.symbol}
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <Text style={styles.selectPoolText}>
            {selectedPool ? 'No active stake in this pool' : 'Select a staking pool to continue'}
          </Text>
        )}
      </View>
    );
  };

  const renderRewardsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Claim Rewards</Text>
      
      {userStakes.length > 0 ? (
        userStakes.map(stake => {
          const rewards = calculateRewards(stake);
          
          return (
            <Card key={stake._id} style={styles.rewardCard}>
              <Card.Content>
                <View style={styles.rewardHeader}>
                  <Text style={styles.rewardPoolName}>
                    {stake.pool.stakeToken.symbol} → {stake.pool.rewardToken.symbol}
                  </Text>
                  <Text style={styles.rewardApr}>{stake.pool.apr}% APR</Text>
                </View>
                
                <View style={styles.rewardStats}>
                  <View style={styles.rewardStat}>
                    <Text style={styles.rewardStatLabel}>Staked</Text>
                    <Text style={styles.rewardStatValue}>
                      {parseFloat(stake.amount).toFixed(4)} {stake.pool.stakeToken.symbol}
                    </Text>
                  </View>
                  
                  <View style={styles.rewardStat}>
                    <Text style={styles.rewardStatLabel}>Pending Rewards</Text>
                    <Text style={styles.rewardStatValue}>
                      {rewards.toFixed(6)} {stake.pool.rewardToken.symbol}
                    </Text>
                  </View>
                </View>
                
                <Button
                  mode="outlined"
                  onPress={() => handleClaimRewards(stake._id)}
                  style={styles.claimButton}
                  disabled={isLoading || rewards <= 0}
                  loading={isLoading}
                >
                  Claim Rewards
                </Button>
              </Card.Content>
            </Card>
          );
        })
      ) : (
        <Text style={styles.noStakesText}>No active stakes found</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <Card style={styles.headerCard}>
          <Card.Content>
            <Title style={styles.headerTitle}>Staking Pools</Title>
            <Text style={styles.headerSubtitle}>
              Stake SOL or USDT to earn memecoin rewards with attractive APR
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.poolsContainer}>
          <Text style={styles.poolsTitle}>Available Pools</Text>
          {stakingPools.map(pool => renderStakingPoolCard(pool))}
        </View>

        <View style={styles.tabContainer}>
          <View style={styles.tabHeader}>
            {['stake', 'unstake', 'rewards'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabButtonText,
                  activeTab === tab && styles.activeTabButtonText
                ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === 'stake' && renderStakeTab()}
          {activeTab === 'unstake' && renderUnstakeTab()}
          {activeTab === 'rewards' && renderRewardsTab()}
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
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
  headerCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  poolsContainer: {
    margin: 16,
    marginTop: 8,
  },
  poolsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12,
  },
  poolCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPoolCard: {
    borderColor: theme.colors.primary,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  poolInfo: {
    flex: 1,
  },
  poolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  poolSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  aprContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 8,
    padding: 8,
  },
  aprValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  aprLabel: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  poolDivider: {
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  poolStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  rewardsContainer: {
    marginTop: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.positive + '10',
    borderRadius: 8,
    padding: 8,
  },
  rewardsLabel: {
    fontSize: 12,
    color: theme.colors.positive,
    marginBottom: 4,
  },
  rewardsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.positive,
  },
  tabContainer: {
    margin: 16,
    marginTop: 8,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    color: '#888',
  },
  activeTabButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  tabContent: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  selectedPoolInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedPoolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  selectedPoolApr: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  input: {
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  percentageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  percentageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  percentageText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
  },
  selectPoolText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
  stakeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stakeLabel: {
    fontSize: 14,
    color: '#888',
  },
  stakeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  lockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lockLabel: {
    fontSize: 14,
    color: '#888',
  },
  lockChip: {
    height: 28,
  },
  lockedChip: {
    backgroundColor: theme.colors.error + '20',
  },
  unlockedChip: {
    backgroundColor: theme.colors.positive + '20',
  },
  lockWarning: {
    fontSize: 12,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  rewardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardPoolName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  rewardApr: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  rewardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rewardStat: {
    flex: 1,
    alignItems: 'center',
  },
  rewardStatLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  rewardStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  claimButton: {
    borderColor: theme.colors.primary,
  },
  noStakesText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
});

export default StakingScreen;
