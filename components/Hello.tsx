import { api } from "@/trpc-utils/api";
import { StyleSheet } from "react-native";
import { ThemedText as Text } from "@/components/ThemedText";

export function Hello() {
  const [hello] = api.post.hello.useSuspenseQuery({ text: "World" });

  return <Text style={styles.title}>{hello.greeting}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
