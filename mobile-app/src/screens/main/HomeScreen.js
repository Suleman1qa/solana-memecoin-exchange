import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, Title, Paragraph, Chip, Avatar, Divider, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrendingTokens, fetchNewListings, fetchGraduatingTokens, fetchGraduatedTokens } from '../../store/slices/tokenSlice';
import { theme } from '../../theme';
import TokenCard from '../../components/TokenCard';
import SectionHeader from '../../components/SectionHeader';

const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const { 
    trendingTokens, 
    newListings, 
    graduatingTokens, 
    graduatedTokens, 
    isLoading 
  } = useSelector(state => state.token);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    dispatch(fetchTrendingTokens({ timeframe: '24h', limit: 10 }));
    dispatch(fetchNewListings({ limit: 10 }));
    dispatch(fetchGraduatingTokens({ limit: 5 }));
    dispatch(fetchGraduatedTokens({ limit: 5 }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToTokenDetail = (tokenAddress) => {
    navigation.navigate('TokenDetail', { tokenAddress });
  };

  const renderTokenListItem = ({ item }) => (
    <TokenCard token={item} onPress={() => navigateToTokenDetail(item.address)} />
  );

  const renderTokenSection = (title, data, viewAllAction, emptyMessage) => (
    <View style={styles.section}>
      <SectionHeader title={title} onViewAll={viewAllAction} />
      
      {data.length === 0 ? (
        <Text style={styles.emptyText}>{emptyMessage || 'No tokens available'}</Text>
      ) : (
        <FlatList
          data={data}
          renderItem={renderTokenListItem}
          keyExtractor={(item) => item.address}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tokenList}
        />
      )}
    </View>
  );

  if (isLoading && !refreshing && !trendingTokens.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <View style={styles.welcomeHeader}>
            <View>
              <Title style={styles.welcomeTitle}>Welcome, {user?.username || 'Trader'}!</Title>
              <Paragraph style={styles.welcomeSubtitle}>Discover the newest Solana memecoins</Paragraph>
            </View>
            <Avatar.Text size={40} label={user?.username?.charAt(0) || 'U'} color={theme.colors.text} style={styles.avatar} />
          </View>
        </Card.Content>
      </Card>

      {renderTokenSection(
        'Trending Memecoins',
        trendingTokens,
        () => navigation.navigate('Market', { screen: 'Trending' }),
        'No trending tokens available'
      )}

      {renderTokenSection(
        'New Listings',
        newListings,
        () => navigation.navigate('Market', { screen: 'NewListings' }),
        'No new listings available'
      )}

      {renderTokenSection(
        'Graduating Soon',
        graduatingTokens,
        () => navigation.navigate('Market', { screen: 'Graduating' }),
        'No graduating tokens available'
      )}

      {renderTokenSection(
        'Recently Graduated',
        graduatedTokens,
        () => navigation.navigate('Market', { screen: 'Graduated' }),
        'No graduated tokens available'
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    margin: 16,
    backgroundColor: theme.colors.surface,
    elevation: 4,
    borderRadius: 12,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  welcomeSubtitle: {
    color: '#888',
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  tokenList: {
    paddingVertical: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    padding: 16,
  },
});

export default HomeScreen;