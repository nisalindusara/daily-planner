// Helper function to dynamically find the Monday of the current week
function getMonday(d = new Date()) {
  const date = new Date(d);
  const day = date.getDay();
  // If it's Sunday (0), go back 6 days. Otherwise, go back (day - 1) days.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff)).toISOString().split("T")[0];
}

export default getMonday;
