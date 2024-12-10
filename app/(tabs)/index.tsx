import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";
import { ThemedView as View } from "@/components/ThemedView";

import { trpcApi } from "@/trpc/utils/trpc-provider";

export default function Page() {
  const { isLoading, data: hello } = trpcApi.post.hello.useQuery({
    text: "from tRPC",
  });
  const utils = trpcApi.useUtils();

  const handleRefetch = () => {
    utils.post.hello.reset();
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Expo App Idea Generator</Text>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <Text style={styles.subtitle}>{hello?.greeting}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleRefetch}>
          <Text style={styles.buttonText}>Refetch</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: "auto",
  },
  main: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
    alignItems: "flex-start",
    maxWidth: 640,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 24,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  button: {
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    // color: "white",
  },
});
