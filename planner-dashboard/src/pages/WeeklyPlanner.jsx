import ActivityList from "../components/ActivityList";

function WeeklyView({
  weekPool,
  deleteActivity,
  refreshCurrentView,
  day1Date,
  day1Tasks,
  day2Date,
  day2Tasks,
  day3Date,
  day3Tasks,
}) {
  return (
    <section className="task-cards">
      <div>
        <span>This Week's Pool</span>
        <div className="week-card">
          <ActivityList
            activities={weekPool}
            deleteActivity={(id) => deleteActivity(id, refreshCurrentView)}
          />
        </div>
      </div>
      <div>
        <span>Day 1 {day1Date}</span>
        <div className="day-card">
          <ActivityList
            activities={day1Tasks}
            deleteActivity={(id) => deleteActivity(id, refreshCurrentView)}
          />
        </div>
      </div>
      <div>
        <span>Day 2 {day2Date}</span>
        <div className="day-card">
          <ActivityList
            activities={day2Tasks}
            deleteActivity={(id) => deleteActivity(id, refreshCurrentView)}
          />
        </div>
      </div>
      <div>
        <span>Day 3 {day3Date}</span>
        <div className="day-card">
          <ActivityList
            activities={day3Tasks}
            deleteActivity={(id) => deleteActivity(id, refreshCurrentView)}
          />
        </div>
      </div>
    </section>
  );
}

export default WeeklyView;
