import { supabase } from "../supabaseClient";

async function deleteActivity(id, fetchActivities) {
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) {
    console.log("Error deleting:", error);
  } else {
    // FIX 4: Re-fetch to update the UI, no matter which column it was in
    fetchActivities();
  }
}

export default deleteActivity;
