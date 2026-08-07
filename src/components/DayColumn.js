import "../styles/DayColumn.css";

import EventCard from "./EventCard";

function DayColumn({
  date,
  events,
  columnWidth,
  isSameDate,
  formatDayLabel,
  onAddClick,
}) {
  const today = isSameDate(date, new Date());
  return (
    <div className="day-column" style={{ width: columnWidth }}>
      <div className="daydate-container">
        <span className="day-text">{formatDayLabel(date)}</span>
        <span
          className="date-text"
          style={{
            color: today ? "#fff" : "#444",
            background: today ? "#4d7cf5" : "transparent",
          }}
        >
          {date.getDate()}
        </span>
      </div>
      <div className="activities">
        {events.length === 0 ? (
          <div className="empty-day">
            <span>Plan the day</span>
          </div>
        ) : (
          events.map((ev) => <EventCard key={ev.id} {...ev} />)
        )}
        <button
          className="add-activity-btn"
          onClick={() => onAddClick(date)}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="Add Activity"
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default DayColumn;
