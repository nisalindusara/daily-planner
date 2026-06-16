// src/App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

import "./App.css";

import AddTaskForm from "./components/AddTaskForm";
import ActivityList from "./components/ActivityList";
import TaskCard from "./components/TaskCard";

function App() {
  const [activities, setActivities] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function fetchActivities() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("planned_date", { ascending: true });

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchActivities();
  }, []);

  async function addActivity(e) {
    e.preventDefault();
    if (!newTask || !newDate) return;

    const { data, error } = await supabase
      .from("activities")
      .insert([{ title: newTask, planned_date: newDate, is_completed: false }])
      .select();

    if (error) {
      console.log("Error adding:", error);
    } else {
      setNewTask("");
      setNewDate("");
      setActivities((prev) =>
        [...prev, data[0]].sort(
          (a, b) => new Date(a.planned_date) - new Date(b.planned_date),
        ),
      );
    }
  }

  async function deleteActivity(id) {
    const { error } = await supabase.from("activities").delete().eq("id", id);

    if (error) {
      console.log("Error deleting:", error);
    } else {
      setActivities((prev) => prev.filter((activity) => activity.id !== id));
    }
  }
  return (
    <div
      style={{
        margin: "40px auto",
        fontFamily: "sans-serif",
        padding: "20px",
      }}
    >
      {/* ADD NEW TASK FORM */}
      <AddTaskForm
        addActivity={addActivity}
        newTask={newTask}
        setNewTask={setNewTask}
        newDate={newDate}
        setNewDate={setNewDate}
      />

      {/* ACTIVITY LIST */}
      {isLoading ? (
        <p style={{ textAlign: "center" }}>Loading tasks...</p>
      ) : (
        <section className="task-cards">
          <div>
            <span>This Week's Pool</span>
            <div className="week-card">
              <ActivityList
                activities={activities}
                deleteActivity={deleteActivity}
              />
            </div>
          </div>
          <div>
            <span>Day 1</span>
            <div className="day-card">
              <TaskCard
                activity={{
                  id: 1,
                  title: "Dummy Activity",
                  planned_date: "2026-01-01",
                }}
                deleteActivity={deleteActivity}
              />
            </div>
          </div>
          <div>
            <span>Day 2</span>
            <div className="day-card">
              <TaskCard
                activity={{
                  id: 1,
                  title: "Dummy Activity",
                  planned_date: "2026-01-01",
                }}
                deleteActivity={deleteActivity}
              />
            </div>
          </div>
          <div>
            <span>Day 3</span>
            <div className="day-card">
              <TaskCard
                activity={{
                  id: 1,
                  title: "Dummy Activity",
                  planned_date: "2026-01-01",
                }}
                deleteActivity={deleteActivity}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
