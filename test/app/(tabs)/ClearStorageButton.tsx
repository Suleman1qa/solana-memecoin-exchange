import React from "react";
import { Button, View } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ClearStorageButton() {
  return (
    <View style={{ margin: 16 }}>
      <Button
        title="Clear App Storage (Debug)"
        color="#d32f2f"
        onPress={async () => {
          await AsyncStorage.clear();
          alert("Storage cleared! Please restart the app.");
        }}
      />
    </View>
  );
}
