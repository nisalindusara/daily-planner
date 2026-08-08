import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../utilities/Supabaseclient";

// import styles
import "../styles/weekly-planner.css";

// import components
import DayColumn from "./DayColumn";
import AddActivity from "./AddActivity";

const MOBILE_BREAKPOINT = 800;

function getVisibleDays() {
  return window.innerWidth < MOBILE_BREAKPOINT ? 1 : 7;
}

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

// ---- main component --------------------------------------------------

export default function WeeklyPlanner() {
  const viewportRef = useRef(null);
  const [columnWidth, setColumnWidth] = useState(0);
  const [visibleDays, setVisibleDays] = useState(getVisibleDays);
  const REST_TRANSLATE = -BUFFER_DAYS * columnWidth;

  // startDate = leftmost VISIBLE day (Monday of the current week on first load)
  const [startDate, setStartDate] = useState(() => getWeekStart(new Date()));
  const [activities, setActivities] = useState([]);
  const [defaults, setDefaults] = useState([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingDate, setAddingDate] = useState(null);

  const [translate, setTranslate] = useState(REST_TRANSLATE);
  const [transitionOn, setTransitionOn] = useState(false);

  const dragRef = useRef({ dragging: false, startX: 0, lastDelta: 0 });
  const pendingDelta = useRef(0);

  // Fetch a wide padded window around startDate. Re-runs any time startDate
  // changes (i.e. after any committed shift), so it works for arbitrarily
  // distant past/future dates — there's no hardcoded range limit.
  const startTime = startDate.getTime();
  useEffect(() => {
    let cancelled = false;
    async function fetchWindow() {
      setLoading(true);
      const from = toISODate(addDays(startDate, -FETCH_PAD_DAYS));
      const to = toISODate(
        addDays(startDate, visibleDays - 1 + FETCH_PAD_DAYS),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  useEffect(() => {
    function measure() {
      if (viewportRef.current) {
        const vd = getVisibleDays();
        setVisibleDays(vd);
        setColumnWidth(viewportRef.current.offsetWidth / vd);
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

  useEffect(() => {
    let cancelled = false;
    async function fetchDefaults() {
      const { data, error } = await supabase
        .from("default_activities")
        .select("*");
      if (!cancelled && !error) setDefaults(data);
    }
    fetchDefaults();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const totalColumns = visibleDays + BUFFER_DAYS * 2;
  const trackDates = Array.from({ length: totalColumns }, (_, i) =>
    addDays(startDate, i - BUFFER_DAYS),
  );

  const eventsByDate = new Map();
  for (const row of activities) {
    const key = row.activity_date;
    if (!eventsByDate.has(key)) eventsByDate.set(key, []);
    eventsByDate.get(key).push(row);
  }

  function getDayEvents(iso) {
    const real = eventsByDate.get(iso) || [];
    const overriddenKeys = new Set(
      real.filter((r) => r.activity_key).map((r) => r.activity_key),
    );
    const virtual = defaults
      .filter((d) => !overriddenKeys.has(d.activity_key))
      .map((d) => ({
        id: `virtual-${d.activity_key}-${iso}`,
        activity_date: iso,
        title: d.title,
        time_range: d.time_range,
        color: d.color,
        block_height: d.block_height,
        sort_order: d.sort_order,
        end_minutes: d.end_minutes,
        activity_key: d.activity_key,
        isVirtual: true,
      }));

    const sorted = [...real, ...virtual].sort(
      (a, b) => a.sort_order - b.sort_order,
    );

    // Insert a gap marker wherever there's genuinely free time. Uses the
    // running latest end-time seen so far (not just the previous task's end)
    // so overlapping tasks don't produce an incorrect gap.
    const withGaps = [];
    let runningEnd = null;
    for (const ev of sorted) {
      const start = ev.sort_order;
      const end = ev.end_minutes ?? start;
      if (runningEnd !== null) {
        const gapMinutes = start - runningEnd;
        if (gapMinutes > 0) {
          withGaps.push({
            id: `gap-${iso}-${start}`,
            isGap: true,
            label: formatGapLabel(gapMinutes),
          });
        }
      }
      withGaps.push(ev);
      runningEnd = runningEnd === null ? end : Math.max(runningEnd, end);
    }

    return withGaps;
  }

  function formatGapLabel(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m free`;
    if (m === 0) return `${h}h free`;
    return `${h}h ${m}m free`;
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
                  events={getDayEvents(toISODate(date))}
                  isSameDate={isSameDate}
                  formatDayLabel={formatDayLabel}
                  onAddClick={setAddingDate}
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

      {addingDate && (
        <AddActivity
          date={addingDate}
          onClose={() => setAddingDate(null)}
          onSaved={(newRow) => {
            setActivities((prev) => [...prev, newRow]);
            setAddingDate(null);
          }}
        />
      )}
    </div>
  );
}
