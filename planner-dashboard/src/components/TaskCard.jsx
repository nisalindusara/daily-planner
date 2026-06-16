function TaskCard({ activity, deleteActivity }) {
  return (
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
        <span
          style={{
            fontSize: "0.85rem",
            color: "#666",
            textAlign: "left",
          }}
        >
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
  );
}

export default TaskCard;
