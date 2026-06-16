function AddTaskForm({
  addActivity,
  newTask,
  setNewTask,
  newDate,
  setNewDate,
}) {
  return (
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
  );
}

export default AddTaskForm;
