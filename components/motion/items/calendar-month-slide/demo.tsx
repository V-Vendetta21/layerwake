import { useState } from 'react';
import { CalendarMonthSlide } from './calendar-month-slide';

export default function Demo() {
  const [date, setDate] = useState<Date | null>(new Date(2026, 10, 14));
  return (
    <div style={{ display: 'grid', gap: 8, width: 300, maxWidth: '100%' }}>
      <CalendarMonthSlide
        value={date}
        onChange={setDate}
        label='Departure date'
      />
      <span role='status' style={{ color: '#b8b8b8', fontSize: 13 }}>
        Departure:{' '}
        {date
          ? date.toLocaleDateString(undefined, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : 'none'}
      </span>
    </div>
  );
}
