import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTokens } from '../../store/slices/tokenSlice';
import { theme } from '../../theme';
import TokenListItem from '../../components/TokenListItem';

const categories = [
  { id: 'all', label: 'All' },
  { id: 'MEMECOIN', label: 'Memecoins' },
  { id: 'STABLECOIN', label: 'Stablecoins' },
  { id: 'TOKEN', label: 'Tokens' }
];

const statuses = [
  { id: 'all', label: 'All' },
  { id: 'NEW', label: 'New' },
  { id: 'GRADUATING', label: 'Graduating' },
  { id: 'GRADUATED', label: 'Graduated' }
];

const sortOptions = [
  { id: '-volume24h', label: 'Volume ↓' },
  { id: 'volume24h', label: 'Volume ↑' },
  { id: '-priceChange24h', label: 'Gainers' },
  { id: 'priceChange24h', label: 'Losers' },
  { id: '-launchDate', label: 'Newest' },
  { id: 'launchDate', label: 'Oldest' }
];

const MarketScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState('-volume24h');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch();
  const { tokens, pagination, isLoading } = useSelector(state => state.token);

  useEffect(() => {
    loadTokens();
  }, [selectedCategory, selectedStatus, selectedSort]);

  const loadTokens = () => {
    const params = {
      page: 1,
      limit: 20,
      sort: selectedSort,
      search: searchQuery,
    };

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }

    dispatch(fetchTokens(params));
  };

  const handleSearch = () => {
    loadTokens();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTokens();
    setRefreshing(false);
  };

  const loadMoreTokens = () => {
    if (pagination.page < pagination.pages && !isLoading) {
      const params = {
        page: pagination.page + 1,
        limit: pagination.limit,
        sort: selectedSort,
        search: searchQuery,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      dispatch(fetchTokens(params));
    }
  };

  const navigateToTokenDetail = (tokenAddress) => {
    navigation.navigate('TokenDetail', { tokenAddress });
  };

  const renderTokenItem = ({ item }) => (
    <TokenListItem token={item} onPress={() => navigateToTokenDetail(item.address)} />
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tokens..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchbar}
          iconColor={theme.colors.primary}
          theme={{ colors: { primary: theme.colors.primary } }}
        />
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {categories.map(category => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.chip,
                  selectedCategory === category.id && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === category.id && styles.selectedChipText
                ]}
                mode="outlined"
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.filterTitle}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {statuses.map(status => (
              <Chip
                key={status.id}
                selected={selectedStatus === status.id}
                onPress={() => setSelectedStatus(status.id)}
                style={[
                  styles.chip,
                  selectedStatus === status.id && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedStatus === status.id && styles.selectedChipText
                ]}
                mode="outlined"
              >
                {status.label}
              </Chip>
            ))}
          </ScrollView>

          <Text style={styles.filterTitle}>Sort By:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {sortOptions.map(option => (
              <Chip
                key={option.id}
                selected={selectedSort === option.id}
                onPress={() => setSelectedSort(option.id)}
                style={[
                  styles.chip,
                  selectedSort === option.id && styles.selectedChip
                ]}
                textStyle={[
                  styles.chipText,
                  selectedSort === option.id && styles.selectedChipText
                ]}
                mode="outlined"
              >
                {option.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading && tokens.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tokens}
          renderItem={renderTokenItem}
          keyExtractor={(item) => item.address}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreTokens}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tokens found</Text>
            </View>
          }
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
  },
  filterButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  filterButtonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  filterTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  chipScrollView: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.primary,
  },
  selectedChipText: {
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  divider: {
    backgroundColor: theme.colors.border,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default MarketScreen;