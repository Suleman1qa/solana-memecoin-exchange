import React, { useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text, Searchbar, Chip, ActivityIndicator, Divider } from "react-native-paper";
import { Colors } from "../../constants/Colors";
import { useRouter } from "expo-router";

const categories = [
  { id: "all", label: "All" },
  { id: "MEMECOIN", label: "Memecoins" },
  { id: "STABLECOIN", label: "Stablecoins" },
  { id: "TOKEN", label: "Tokens" },
];

const statuses = [
  { id: "all", label: "All" },
  { id: "NEW", label: "New" },
  { id: "GRADUATING", label: "Graduating" },
  { id: "GRADUATED", label: "Graduated" },
];

const sortOptions = [
  { id: "-volume24h", label: "Volume ↓" },
  { id: "volume24h", label: "Volume ↑" },
  { id: "-priceChange24h", label: "Gainers" },
  { id: "priceChange24h", label: "Losers" },
  { id: "-launchDate", label: "Newest" },
  { id: "launchDate", label: "Oldest" },
];

// Dummy data for demonstration
const tokens = [
  { address: "token1", symbol: "MEME", name: "Memecoin", price: "0.000123", category: "MEMECOIN", status: "NEW" },
  { address: "token2", symbol: "DOGE", name: "Dogecoin", price: "0.123456", category: "MEMECOIN", status: "GRADUATED" },
  { address: "token3", symbol: "USDT", name: "USD Token", price: "1.00", category: "STABLECOIN", status: "ALL" },
  { address: "token4", symbol: "GEN", name: "Generic Token", price: "0.50", category: "TOKEN", status: "GRADUATING" },
];

const MarketScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSort, setSelectedSort] = useState("-volume24h");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredTokens = tokens.filter((token) => {
    if (searchQuery && !token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== "all" && token.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== "all" && token.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate data fetch
    setRefreshing(false);
  };

  const renderTokenItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.tokenItem} onPress={() => router.push({ pathname: "/(tabs)/TradingScreen", params: { token: JSON.stringify(item) } })}>
      <View style={styles.tokenInfo}>
        <Text style={styles.tokenSymbol}>{item.symbol}</Text>
        <Text style={styles.tokenName}>{item.name}</Text>
      </View>
      <Text style={styles.tokenPrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  if (refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tokens..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor={Colors.light.primary}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={selectedCategory === category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.chip,
                  selectedCategory === category.id && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === category.id && styles.selectedChipText,
                ]}
                mode="outlined"
              >
                {category.label}
              </Chip>
            ))}
          </ScrollView>
          <Text style={styles.filterTitle}>Status:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {statuses.map((status) => (
              <Chip
                key={status.id}
                selected={selectedStatus === status.id}
                onPress={() => setSelectedStatus(status.id)}
                style={[
                  styles.chip,
                  selectedStatus === status.id && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedStatus === status.id && styles.selectedChipText,
                ]}
                mode="outlined"
              >
                {status.label}
              </Chip>
            ))}
          </ScrollView>
          <Text style={styles.filterTitle}>Sort By:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScrollView}>
            {sortOptions.map((option) => (
              <Chip
                key={option.id}
                selected={selectedSort === option.id}
                onPress={() => setSelectedSort(option.id)}
                style={[
                  styles.chip,
                  selectedSort === option.id && styles.selectedChip,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedSort === option.id && styles.selectedChipText,
                ]}
                mode="outlined"
              >
                {option.label}
              </Chip>
            ))}
          </ScrollView>
        </View>
      )}
      <FlatList
        data={filteredTokens}
        renderItem={renderTokenItem}
        keyExtractor={(item) => item.address}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tokens found</Text>
          </View>
        }
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  searchbar: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
  },
  filterButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  filterButtonText: {
    color: Colors.light.text,
    fontWeight: "bold",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: Colors.light.background,
  },
  filterTitle: {
    marginTop: 8,
    marginBottom: 8,
    color: Colors.light.primary,
    fontWeight: "bold",
  },
  chipScrollView: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: "transparent",
    borderColor: Colors.light.primary,
  },
  selectedChip: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    color: Colors.light.primary,
  },
  selectedChipText: {
    color: Colors.light.text,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  divider: {
    backgroundColor: Colors.light.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  tokenItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  tokenInfo: {
    flexDirection: "column",
  },
  tokenSymbol: {
    fontWeight: "bold",
    fontSize: 18,
    color: Colors.light.primary,
  },
  tokenName: {
    fontSize: 14,
    color: "#888",
  },
  tokenPrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.light.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MarketScreen;
