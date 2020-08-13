export type DateType = string | number | Date | (string | number)[];
export type DayType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type EventType = (payload?: any) => void;
export type EventName = "change" | "dateChange";

export interface CalendarProps {
  current?: DateType;
  value?: DateType | DateType[];
  defaultValue?: DateType | DateType[];
  maxChecked?: number;
  valueFormat?: string;
  startWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  disabledDate?: (currentDate: DateCell) => boolean;
}

export interface WeekCell {
  name: string;
  value: DayType;
}

export interface DateCell {
  year: string;
  month: string;
  date: string;
  day: DayType;
  value: string;
  timestamp: number;
  inView: boolean;
  disabled: boolean;
}

export interface CalendarInstance {
  weekCells: WeekCell[];
  dateCells: DateCell[];
  checkeds: number[];
  currentYear: string;
  currentMonth: string;
  setCurrent: (date?: DateType) => DateCell[];
  setChecked: (date?: DateType | DateType[] | DayType, checked?: boolean) => number[];
  clearChecked: () => void;
  reload: (date?: DateType) => void;
  prev: () => void;
  next: () => void;
  on: (type: EventName, fn: EventType) => void;
  off: (type?: EventName) => void;
  emit: (type: EventName, ...rest: any) => void;
}
