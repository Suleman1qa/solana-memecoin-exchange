import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function TokenScreen() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Token Details: {id}</Text>
    </View>
  );
}
