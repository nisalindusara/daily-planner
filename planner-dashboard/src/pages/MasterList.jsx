import ActivityList from "../components/ActivityList";

function MasterList({ allTasks, deleteActivity, refreshCurrentView }) {
  return (
    <section style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h2>All Historical Tasks</h2>
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <ActivityList
          activities={allTasks}
          deleteActivity={(id) => deleteActivity(id, refreshCurrentView)}
        />
      </div>
    </section>
  );
}

export default MasterList;
