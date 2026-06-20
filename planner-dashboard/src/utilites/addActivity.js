import getMonday from "./getMonday";
import { supabase } from "../supabaseClient";

async function addActivity(
  e,
  newTask,
  newDate,
  setNewTask,
  setNewDate,
  fetchActivities,
) {
  e.preventDefault();

  // FIX 1: Make date optional so Week Pool works
  if (!newTask) return;

  const day1Date = getMonday();

  const { error } = await supabase.from("activities").insert([
    {
      title: newTask,
      planned_date: newDate || null, // Send null if the user leaves it blank
      week_start_date: day1Date, // FIX 2: Anchor it to the current week
      is_completed: false,
    },
  ]);

  if (error) {
    console.log("Error adding:", error);
  } else {
    setNewTask("");
    setNewDate("");
    // FIX 3: Re-fetch the data to let your main logic distribute it perfectly
    fetchActivities();
  }
}

export default addActivity;
