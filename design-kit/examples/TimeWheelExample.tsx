import { useState } from "react";
import { TimeWheel, type TimeWheelValue } from "..";

export function TimeWheelExample() {
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
    <div className="space-y-4 bg-canvas p-5">
      <TimeWheel label="Check In" value={checkIn} onChange={setCheckIn} />
      <TimeWheel label="Check Out" value={checkOut} onChange={setCheckOut} />
    </div>
  );
}
