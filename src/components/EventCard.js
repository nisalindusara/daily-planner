import "../styles/EventCard.css";

function EventCard({ title, time_range, color, block_height }) {
  return (
    <div
      className="event-card"
      style={{ background: color, minHeight: block_height }}
    >
      <span className="title-text">{title}</span>
      <span className="time-text">{time_range}</span>
    </div>
  );
}

export default EventCard;
