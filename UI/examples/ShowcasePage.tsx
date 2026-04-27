import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  TimeWheel,
  TopBar,
  type TimeWheelValue,
} from "@kit";

export function ShowcasePage() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date(2025, 11, 13)); // Dec 13 2025
  const [checkIn, setCheckIn] = useState<TimeWheelValue>({
    hour: 1,
    minute: 0,
    meridiem: "PM",
  });
  const [checkOut, setCheckOut] = useState<TimeWheelValue>({
    hour: 10,
    minute: 0,
    meridiem: "AM",
  });

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <main className="flex-1 px-5 pb-12 pt-6">
        <TopBar
          variant="title"
          title="Component Showcase"
          onBack={() => navigate(-1)}
        />

        <h1 className="mt-6 font-serif text-[32px] font-bold leading-tight tracking-tight text-ink">
          Calendar
        </h1>
        <p className="mt-1 text-small text-ink-secondary">
          Full month grid with a soft pink panel and lavender selected day.
        </p>

        <Calendar
          className="mt-4"
          value={date}
          onSelect={setDate}
        />

        <div className="mt-3 text-small text-ink-secondary">
          Selected:{" "}
          <span className="font-semibold text-ink">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="mt-10 font-serif text-[32px] font-bold leading-tight tracking-tight text-ink">
          Time Wheel
        </h1>
        <p className="mt-1 text-small text-ink-secondary">
          Wheel scroller picker. Drag, scroll, or tap a row to select.
        </p>

        <div className="mt-4 space-y-4">
          <TimeWheel label="Check In" value={checkIn} onChange={setCheckIn} />
          <TimeWheel label="Check Out" value={checkOut} onChange={setCheckOut} />
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 text-small text-ink-secondary shadow-soft">
          <div>
            Check In:{" "}
            <span className="font-semibold tabular-nums text-ink">
              {checkIn.hour}:{checkIn.minute.toString().padStart(2, "0")} {checkIn.meridiem}
            </span>
          </div>
          <div>
            Check Out:{" "}
            <span className="font-semibold tabular-nums text-ink">
              {checkOut.hour}:{checkOut.minute.toString().padStart(2, "0")} {checkOut.meridiem}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

