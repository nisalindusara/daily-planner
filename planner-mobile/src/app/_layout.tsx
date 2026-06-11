import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      {/* This tells the app to load your index.tsx screen and hide the default top header */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
