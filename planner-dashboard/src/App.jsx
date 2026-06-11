// src/App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [activities, setActivities] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");

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
  }

  useEffect(() => {
    fetchActivities();
  }, []);

  async function addActivity(e) {
    e.preventDefault();
    if (!newTask || !newDate) return;

    const { error } = await supabase
      .from("activities")
      .insert([{ title: newTask, planned_date: newDate, is_completed: false }]);

    if (error) {
      console.log("Error adding:", error);
    } else {
      setNewTask("");
      setNewDate("");
      fetchActivities();
    }
  }

  async function deleteActivity(id) {
    const { error } = await supabase.from("activities").delete().eq("id", id);

    if (error) {
      console.log("Error deleting:", error);
    } else {
      fetchActivities();
    }
  }
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>My Daily Planner</h1>

      {/* ADD NEW TASK FORM */}
      <form
        onSubmit={addActivity}
        style={{ display: "flex", gap: "10px", marginBottom: "30px" }}
      >
        <input
          type="text"
          placeholder="What needs to be done?"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </form>

      {/* ACTIVITY LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {activities.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>
            No activities planned yet. Enjoy your day!
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #eee",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "1.1rem",
                    color: "#333",
                  }}
                >
                  {activity.title}
                </strong>
                <span style={{ fontSize: "0.85rem", color: "#666" }}>
                  {activity.planned_date}
                </span>
              </div>

              <button
                onClick={() => deleteActivity(activity.id)}
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
