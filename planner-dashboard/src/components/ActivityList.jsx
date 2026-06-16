import TaskCard from "./TaskCard";

function ActivityList({ activities, deleteActivity }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {activities.length === 0 ? (
        <p style={{ textAlign: "center", color: "#666" }}>
          No activities planned yet. Enjoy your day!
        </p>
      ) : (
        activities.map((activity) => (
          <TaskCard activity={activity} deleteActivity={deleteActivity} />
        ))
      )}
    </div>
  );
}

export default ActivityList;
