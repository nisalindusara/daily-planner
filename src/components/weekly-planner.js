import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../utilities/Supabaseclient";

import "../styles/weekly-planner.css";

const VISIBLE_DAYS = 7;

// How many extra days are rendered off-screen on each side, so a single
// drag gesture can travel that many days before running out of columns.
// Increase this if you want to support longer single-swipe jumps.
const BUFFER_DAYS = 21;

// How far (in days, each direction) we fetch from Supabase around the
// current startDate. Kept equal to BUFFER_DAYS so every rendered column
// always has its data ready — no gaps during a drag.
const FETCH_PAD_DAYS = BUFFER_DAYS;

const TRANSITION_MS = 280;

// ---- date helpers -------------------------------------------------

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDate(a, b) {
  return toISODate(a) === toISODate(b);
}

// Monday-aligned start of the week containing `date`
function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 = Sunday ... 6 = Saturday
  const diff = day === 0 ? -6 : 1 - day; // shift so Monday = start
  return addDays(d, diff);
}

const DAY_LABELS = ["su.", "m.", "tu.", "w.", "th.", "f.", "sa."];
function formatDayLabel(date) {
  return DAY_LABELS[date.getDay()];
}

// ---- presentational components ------------------------------------

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

function DayColumn({ date, events, columnWidth }) {
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
      </div>
    </div>
  );
}

// ---- main component --------------------------------------------------

export default function WeeklyPlanner() {
  const viewportRef = useRef(null);
  const [columnWidth, setColumnWidth] = useState(0);

  const REST_TRANSLATE = -BUFFER_DAYS * columnWidth;

  // startDate = leftmost VISIBLE day (Monday of the current week on first load)
  const [startDate, setStartDate] = useState(() => getWeekStart(new Date()));
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [translate, setTranslate] = useState(REST_TRANSLATE);
  const [transitionOn, setTransitionOn] = useState(false);

  const dragRef = useRef({ dragging: false, startX: 0, lastDelta: 0 });
  const pendingDelta = useRef(0);

  // Fetch a wide padded window around startDate. Re-runs any time startDate
  // changes (i.e. after any committed shift), so it works for arbitrarily
  // distant past/future dates — there's no hardcoded range limit.
  useEffect(() => {
    let cancelled = false;
    async function fetchWindow() {
      setLoading(true);
      const from = toISODate(addDays(startDate, -FETCH_PAD_DAYS));
      const to = toISODate(
        addDays(startDate, VISIBLE_DAYS - 1 + FETCH_PAD_DAYS),
      );
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .gte("activity_date", from)
        .lte("activity_date", to)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error) setError(error.message);
      else {
        setError(null);
        setActivities((prev) => {
          const merged = new Map(prev.map((row) => [row.id, row]));
          for (const row of data) {
            merged.set(row.id, row);
          }
          return Array.from(merged.values());
        });
      }
      setLoading(false);
    }
    fetchWindow();
    return () => {
      cancelled = true;
    };
  }, [startDate.getTime()]);

  useEffect(() => {
    function measure() {
      if (viewportRef.current) {
        setColumnWidth(viewportRef.current.offsetWidth / VISIBLE_DAYS);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setTransitionOn(false);
    setTranslate(-BUFFER_DAYS * columnWidth);
  }, [columnWidth]);

  function animateTo(target, dayDelta) {
    pendingDelta.current = dayDelta;
    setTransitionOn(true);
    setTranslate(target);
  }

  function goNext() {
    animateTo(REST_TRANSLATE - columnWidth, 1);
  }

  function goPrev() {
    animateTo(REST_TRANSLATE + columnWidth, -1);
  }

  function handleTransitionEnd() {
    if (pendingDelta.current !== 0) {
      const delta = pendingDelta.current;
      pendingDelta.current = 0;
      setStartDate((d) => addDays(d, delta));
      // snap back to the fixed rest position instantly, no transition —
      // trackDates recomputes around the new startDate so the view is seamless
      setTransitionOn(false);
      setTranslate(REST_TRANSLATE);
    }
  }

  // ---- drag handlers ----
  function onPointerDown(e) {
    dragRef.current = { dragging: true, startX: e.clientX, lastDelta: 0 };
    setTransitionOn(false);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragRef.current.dragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    dragRef.current.lastDelta = deltaX;
    setTranslate(REST_TRANSLATE + deltaX);
  }

  function endDrag() {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    const deltaX = dragRef.current.lastDelta;

    // How many whole days this drag distance corresponds to.
    // Dragging left (deltaX negative) moves into the future; dragging right
    // (deltaX positive) moves into the past.
    const daysShift = Math.round(-deltaX / columnWidth);

    if (daysShift !== 0) {
      const target = REST_TRANSLATE - daysShift * columnWidth;
      animateTo(target, daysShift);
    } else {
      setTransitionOn(true);
      setTranslate(REST_TRANSLATE);
    }
    dragRef.current.lastDelta = 0;
  }

  // trackDates: BUFFER_DAYS before + VISIBLE_DAYS visible + BUFFER_DAYS after
  const totalColumns = VISIBLE_DAYS + BUFFER_DAYS * 2;
  const trackDates = Array.from({ length: totalColumns }, (_, i) =>
    addDays(startDate, i - BUFFER_DAYS),
  );

  const eventsByDate = new Map();
  for (const row of activities) {
    const key = row.activity_date;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key).push(row);
  }

  return (
    <div className="screen">
      <div className="planner-header">
        <button className="nav-btn" onClick={goPrev} aria-label="Previous day">
          ‹
        </button>
        <div className="planner-viewport" ref={viewportRef}>
          {columnWidth > 0 && (
            <div
              className="planner-track"
              style={{
                width: columnWidth * totalColumns,
                transform: `translateX(${translate}px)`,
                transition: transitionOn
                  ? `transform ${TRANSITION_MS}ms ease`
                  : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerLeave={endDrag}
              onPointerCancel={endDrag}
            >
              {trackDates.map((date) => (
                <DayColumn
                  key={toISODate(date)}
                  date={date}
                  columnWidth={columnWidth}
                  events={eventsByDate.get(toISODate(date)) || []}
                />
              ))}
            </div>
          )}
        </div>
        <button className="nav-btn" onClick={goNext} aria-label="Next day">
          ›
        </button>
      </div>

      {error && (
        <div className="planner-status error">
          Couldn't load activities: {error}
        </div>
      )}
    </div>
  );
}
