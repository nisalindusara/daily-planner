import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";

import "./css/App.css";

import getMonday from "./utilites/getMonday";
import addDays from "./utilites/addDays";
import addActivity from "./utilites/addActivity";
import deleteActivity from "./utilites/deleteActivity";

import NavBar from "./components/NavigationBar";
import AddTaskForm from "./components/AddTaskForm";
import MasterList from "./pages/MasterList";
import WeeklyView from "./pages/WeeklyPlanner";

function App() {
  const [newTask, setNewTask] = useState("");
  const [newDate, setNewDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [weekPool, setWeekPool] = useState([]);
  const [day1Tasks, setDay1Tasks] = useState([]);
  const [day2Tasks, setDay2Tasks] = useState([]);
  const [day3Tasks, setDay3Tasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  // This hook tells us exactly what URL the user is currently looking at
  const location = useLocation();

  const day1Date = getMonday();
  const day2Date = addDays(day1Date, 1);
  const day3Date = addDays(day1Date, 2);

  async function fetchActivities(ignore = false) {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("week_start_date", day1Date)
      .order("planned_date", { ascending: true });

    if (error) {
      console.error("Error fetching:", error);
      return; // Stop execution if there is an error
    }

    if (!ignore) {
      setWeekPool(data.filter((task) => !task.planned_date));
      setDay1Tasks(data.filter((task) => task.planned_date === day1Date));
      setDay2Tasks(data.filter((task) => task.planned_date === day2Date));
      setDay3Tasks(data.filter((task) => task.planned_date === day3Date));
      setIsLoading(false);
    }
  }

  async function fetchAllTasks(ignore = false) {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("planned_date", { ascending: false });

    if (error) {
      console.error("Error fetching all tasks:", error);
      return;
    }
    if (!ignore) {
      setAllTasks(data);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    (async () => {
      if (location.pathname === "/") {
        fetchActivities(ignore);
      } else if (location.pathname === "/master") {
        fetchAllTasks(ignore);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [location.pathname]);

  // Smart refresh that kows which page we are on
  const refreshCurrentView = () => {
    if (location.pathname === "/") fetchActivities();
    else fetchAllTasks();
  };

  return (
    <div className="app">
      {/* NAVIGATION TABS (Now using real URLs) */}
      <NavBar />

      {/* ADD NEW TASK FORM */}
      <AddTaskForm
        addActivity={(e) =>
          addActivity(
            e,
            newTask,
            newDate,
            refreshCurrentView,
            setNewTask,
            setNewDate,
          )
        }
        newTask={newTask}
        setNewTask={setNewTask}
        newDate={newDate}
        setNewDate={setNewDate}
      />

      {/* THE ROUTER CONTROLS WHICH UI TO SHOW BASED ON THE URL */}
      {isLoading ? (
        <p style={{ textAlign: "center" }}>Loading tasks...</p>
      ) : (
        <Routes>
          {/* HOME ROUTE (/) - The Weekly View */}
          <Route
            path="/"
            element={
              <WeeklyView
                weekPool={weekPool}
                deleteActivity={deleteActivity}
                refreshCurrentView={refreshCurrentView}
                day1Date={day1Date}
                day1Tasks={day1Tasks}
                day2Date={day2Date}
                day2Tasks={day2Tasks}
                day3Date={day3Date}
                day3Tasks={day3Tasks}
              />
            }
          />

          {/* MASTER LIST ROUTE (/master) - The Backlog View */}
          <Route
            path="/master"
            element={
              <MasterList
                allTasks={allTasks}
                deleteActivity={deleteActivity}
                refreshCurrentView={refreshCurrentView}
              />
            }
          />
        </Routes>
      )}
    </div>
  );
}

export default App;
