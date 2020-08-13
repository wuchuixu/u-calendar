import {
  dateFomater,
  dateToArray,
  getDateTimestamp,
  getDateDay,
  getMonthDays,
  isDateType,
} from "./utils";
import {
  DateType,
  DayType,
  CalendarProps,
  CalendarInstance,
  DateCell,
  WeekCell,
  EventType,
  EventName,
} from "./data.d";

export default class CalendarStore {
  private currentYear: string;

  private currentMonth: string;

  private maxChecked?: number;

  private initialValue?: DateType | DateType[];

  private weekCells: WeekCell[];

  private dateCells: DateCell[];

  private checkeds: number[];

  private valueFormat: string;

  private startWeek: number;

  private eventMaps: { [name: string]: EventType[] };

  private disabledDate?: (currentDate: DateCell) => boolean;

  private isInit: boolean;

  constructor({
    current,
    value,
    defaultValue,
    maxChecked,
    valueFormat,
    startWeek,
    disabledDate,
  }: CalendarProps) {
    const names = ["日", "一", "二", "三", "四", "五", "六"];
    const arr = names.map(
      (name, index: number) => ({ name, value: index } as WeekCell)
    );
    const [year, month] = dateToArray(current || new Date());
    this.currentYear = year;
    this.currentMonth = month;
    this.initialValue = defaultValue;
    this.initialValue = value;
    this.dateCells = [];
    this.checkeds = [];
    this.maxChecked = maxChecked;
    this.valueFormat = valueFormat || "YYYY-MM-DD";
    this.startWeek = startWeek || 0;
    this.eventMaps = {};
    this.disabledDate = disabledDate;
    this.isInit = true;
    this.setCurrent();
    if (value) {
      this.setChecked(value);
    }
    if (startWeek) {
      arr.push(...arr.splice(0, startWeek));
    }
    this.weekCells = arr;
    this.isInit = false;
  }

  private on = (type: EventName, fn: EventType): void => {
    if (!this.eventMaps[type]) {
      this.eventMaps[type] = [];
    }
    this.eventMaps[type].push(fn);
  };

  private off = (type?: EventName): void => {
    if (type) {
      delete this.eventMaps[type];
    } else {
      this.eventMaps = {};
    }
  };

  private emit = (type: EventName, ...rest: any): void => {
    const fns = this.eventMaps[type];
    if (fns && fns.length) {
      for (let i = 0; i < fns.length; i += 1) {
        if (typeof fns[i] === "function") {
          fns[i].call(this, ...rest);
        }
      }
    }
  };

  private reload = (date?: DateType): void => {
    const [year, month] = dateToArray(date);
    this.currentYear = year || this.currentYear;
    this.currentMonth = month || this.currentMonth;
    this.checkeds = [];
    if (this.initialValue) {
      this.setChecked(this.initialValue);
    }
    this.setCurrent([this.currentYear, this.currentMonth]);
  };

  private getPrevDate = (cy: number, cm: number) => {
    const y = cm - 1 < 1 ? cy - 1 : cy;
    const m = cm - 1 < 1 ? 12 : cm - 1;
    return [y, m];
  };

  private getNextDate = (cy: number, cm: number) => {
    const y = cm + 1 > 12 ? cy + 1 : cy;
    const m = cm + 1 > 12 ? 1 : cm + 1;
    return [y, m];
  };

  private prev = () => {
    const [y, m] = this.getPrevDate(+this.currentYear, +this.currentMonth);
    this.setCurrent([y, m]);
  };

  private next = () => {
    const [y, m] = this.getNextDate(+this.currentYear, +this.currentMonth);
    this.setCurrent([y, m]);
  };

  private setCurrent = (date?: DateType): DateCell[] => {
    const dateCells = [];
    const [year, month] = dateToArray(
      date || [this.currentYear, this.currentMonth],
      true
    );
    const days = getMonthDays([year, month]);
    const day = getDateDay([year, month, 1]);
    const offetDay = day - this.startWeek;
    const preDays = offetDay < 0 ? offetDay + 7 : offetDay;
    const [prevYear, prevMonth] = this.getPrevDate(+year, +month);
    const [nextYear, nextMonth] = this.getNextDate(+year, +month);

    this.currentYear = year;
    this.currentMonth = month;

    // 上一个月
    for (let i = 0; i < preDays; i += 1) {
      const prevDate = getMonthDays([prevYear, prevMonth]) - (preDays - i - 1);
      dateCells.push(this.createDateCell([prevYear, prevMonth, prevDate]));
    }
    // 本月日期
    for (let i = 1; i <= days; i += 1) {
      dateCells.push(this.createDateCell([year, month, i]));
    }
    // 下一个月
    const nextDays =
      dateCells.length % 7 === 0 ? 0 : 7 - (dateCells.length % 7);
    for (let i = 1; i <= nextDays; i += 1) {
      dateCells.push(this.createDateCell([nextYear, nextMonth, i]));
    }

    this.dateCells = dateCells;

    if (!this.isInit) {
      this.emit("dateChange", {
        year,
        month,
        dateCells,
      });
    }

    return dateCells;
  };

  private createDateCell = (data: DateType): DateCell => {
    const timestamp = getDateTimestamp(data, true);
    const value = dateFomater(timestamp, this.valueFormat);
    const [year, month, date] = dateToArray(timestamp, true);
    const day = getDateDay(data);
    const inView = year === this.currentYear && month === this.currentMonth;
    const cell = {
      year,
      month,
      date,
      day,
      value,
      timestamp,
      inView,
      disabled: false,
    };

    if (typeof this.disabledDate === "function") {
      cell.disabled = this.disabledDate(cell);
    }

    return cell;
  };

  private clearChecked = () => {
    this.checkeds = [];
    if (!this.isInit) {
      this.emit("change", []);
    }
  };

  private setChecked = (
    date?: DateType | DateType[] | DayType,
    checked?: boolean
  ): number[] => {
    const dateArr = () => {
      if (Array.isArray(date) && date.every((v) => isDateType(v))) {
        return date;
      }
      return [(date as DateType) || ""];
    };
    let items = dateArr().map((v) => getDateTimestamp(v, true));
    const isDayType =
      typeof date === "number" && Number.isInteger(date) && date <= 6;
    const shouldPush = (flag: boolean) =>
      checked || (checked === undefined && flag);

    if (date === undefined || isDayType) {
      items = this.dateCells
        .filter((v) => v.inView && (!isDayType || v.day === date))
        .map((v) => v.timestamp);
    }

    items.forEach((item) => {
      const idx = this.checkeds.findIndex((v) => v === item);
      const dateCell = this.dateCells.find((v) => v.timestamp === item);

      if (!dateCell || !dateCell.disabled) {
        if (idx !== -1) {
          this.checkeds.splice(idx, 1);
        }
        if (shouldPush(idx === -1)) {
          this.checkeds.push(item);
        }
      }
    });

    if (this.maxChecked && this.checkeds.length > this.maxChecked) {
      this.checkeds.splice(0, this.checkeds.length - this.maxChecked);
    }
    if (!this.isInit) {
      this.emit("change", this.checkeds);
    }
    return this.checkeds;
  };

  public getCalendar = (): CalendarInstance => ({
    weekCells: this.weekCells,
    dateCells: this.dateCells,
    checkeds: this.checkeds,
    currentYear: this.currentYear,
    currentMonth: this.currentMonth,
    setCurrent: this.setCurrent,
    setChecked: this.setChecked,
    clearChecked: this.clearChecked,
    reload: this.reload,
    prev: this.prev,
    next: this.next,
    on: this.on,
    off: this.off,
    emit: this.emit,
  });
}
