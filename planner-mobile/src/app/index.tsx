// src/app/index.tsx
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  RefreshControl,
} from "react-native";
import "react-native-url-polyfill/auto"; // MUST be at the very top

// Paste your Supabase URL and anon public key here
const supabaseUrl = "https://tgyfapyxtqqevxcmwyfv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRneWZhcHl4dHFxZXZ4Y213eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4MTQxNzEsImV4cCI6MjA5NjM5MDE3MX0.t1Fx0matpgodQVARVYFhGIPo5NzCNBBkn11Nu658ABE";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Activity = {
  id: string;
  title: string;
  description: string | null;
  planned_date: string;
  is_completed: boolean;
  created_at: string;
};

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchActivities();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("planned_date", { ascending: true });

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data);
    }
    setLoading(false);
  }

  const renderActivity = ({ item }: { item: Activity }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            item.is_completed && {
              textDecorationLine: "line-through",
              color: "#999",
            },
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.date}>{item.planned_date}</Text>
      </View>

      {/* Visual indicator for completion status */}
      <View
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: item.is_completed ? "#28a745" : "#ffc107",
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Daily Plan</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderActivity}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No activities planned yet.</Text>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007bff"]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f9",
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#222",
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
});
