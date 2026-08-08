import { useState } from "react";
import { supabase } from "../utilities/Supabaseclient";
import "../styles/AddActivity.css";

const PALETTE = ["#c1b296", "#bfae69", "#84a3a6", "#aca365", "#a37e51"];

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date) {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime12(hhmm) {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${mStr}${ampm}`;
}

function minutesSinceMidnight(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function AddActivity({ date, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const startMin = minutesSinceMidnight(startTime);
  const endMin = minutesSinceMidnight(endTime);
  const validTimes = endMin > startMin;

  async function handleSave() {
    if (!title.trim()) {
      setError("Please add a title.");
      return;
    }
    if (!validTimes) {
      setError("End time must be after start time.");
      return;
    }
    setError(null);
    setSaving(true);

    const duration = endMin - startMin;
    const blockHeight = Math.max(50, Math.round(duration * 0.6));
    const timeRange = `${formatTime12(startTime)} – ${formatTime12(endTime)}`;

    const { data, error } = await supabase
      .from("activities")
      .insert({
        activity_date: toISODate(date),
        title: title.trim(),
        time_range: timeRange,
        color,
        block_height: blockHeight,
        sort_order: startMin,
        end_minutes: endMin,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    onSaved(data);
  }

  return (
    <div className="add-activity-screen">
      <div className="add-activity-header">
        <button className="close-btn" onClick={onClose} aria-label="Close">
          ×
        </button>
        <input
          className="title-input"
          placeholder="Add title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <button className="save-btn" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="add-activity-body">
        <div className="date-time-row">
          <span className="date-pill">{formatDisplayDate(date)}</span>
          <input
            type="time"
            className="time-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <span className="to-label">to</span>
          <input
            type="time"
            className="time-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="color-row">
          <span className="color-label">Color</span>
          <div className="color-swatch">
            {PALETTE.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`swatch-dot ${color === hex ? "selected" : ""}`}
                style={{ background: hex }}
                onClick={() => setColor(hex)}
                aria-label={`Choose color ${hex}`}
              />
            ))}
          </div>
        </div>

        {!validTimes && (
          <div className="add-activity-error">
            End time must be after start time.
          </div>
        )}
        {error && <div className="add-activity-error">{error}</div>}
      </div>
    </div>
  );
}

export default AddActivity;
