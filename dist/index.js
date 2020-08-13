"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class CalendarStore {
    constructor({ current, value, defaultValue, maxChecked, valueFormat, startWeek, disabledDate, }) {
        this.on = (type, fn) => {
            if (!this.eventMaps[type]) {
                this.eventMaps[type] = [];
            }
            this.eventMaps[type].push(fn);
        };
        this.off = (type) => {
            if (type) {
                delete this.eventMaps[type];
            }
            else {
                this.eventMaps = {};
            }
        };
        this.emit = (type, ...rest) => {
            const fns = this.eventMaps[type];
            if (fns && fns.length) {
                for (let i = 0; i < fns.length; i += 1) {
                    if (typeof fns[i] === "function") {
                        fns[i].call(this, ...rest);
                    }
                }
            }
        };
        this.reload = (date) => {
            const [year, month] = utils_1.dateToArray(date);
            this.currentYear = year || this.currentYear;
            this.currentMonth = month || this.currentMonth;
            this.checkeds = [];
            if (this.initialValue) {
                this.setChecked(this.initialValue);
            }
            this.setCurrent([this.currentYear, this.currentMonth]);
        };
        this.getPrevDate = (cy, cm) => {
            const y = cm - 1 < 1 ? cy - 1 : cy;
            const m = cm - 1 < 1 ? 12 : cm - 1;
            return [y, m];
        };
        this.getNextDate = (cy, cm) => {
            const y = cm + 1 > 12 ? cy + 1 : cy;
            const m = cm + 1 > 12 ? 1 : cm + 1;
            return [y, m];
        };
        this.prev = () => {
            const [y, m] = this.getPrevDate(+this.currentYear, +this.currentMonth);
            this.setCurrent([y, m]);
        };
        this.next = () => {
            const [y, m] = this.getNextDate(+this.currentYear, +this.currentMonth);
            this.setCurrent([y, m]);
        };
        this.setCurrent = (date) => {
            const dateCells = [];
            const [year, month] = utils_1.dateToArray(date || [this.currentYear, this.currentMonth], true);
            const days = utils_1.getMonthDays([year, month]);
            const day = utils_1.getDateDay([year, month, 1]);
            const offetDay = day - this.startWeek;
            const preDays = offetDay < 0 ? offetDay + 7 : offetDay;
            const [prevYear, prevMonth] = this.getPrevDate(+year, +month);
            const [nextYear, nextMonth] = this.getNextDate(+year, +month);
            this.currentYear = year;
            this.currentMonth = month;
            // 上一个月
            for (let i = 0; i < preDays; i += 1) {
                const prevDate = utils_1.getMonthDays([prevYear, prevMonth]) - (preDays - i - 1);
                dateCells.push(this.createDateCell([prevYear, prevMonth, prevDate]));
            }
            // 本月日期
            for (let i = 1; i <= days; i += 1) {
                dateCells.push(this.createDateCell([year, month, i]));
            }
            // 下一个月
            const nextDays = dateCells.length % 7 === 0 ? 0 : 7 - (dateCells.length % 7);
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
        this.createDateCell = (data) => {
            const timestamp = utils_1.getDateTimestamp(data, true);
            const value = utils_1.dateFomater(timestamp, this.valueFormat);
            const [year, month, date] = utils_1.dateToArray(timestamp, true);
            const day = utils_1.getDateDay(data);
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
        this.clearChecked = () => {
            this.checkeds = [];
            if (!this.isInit) {
                this.emit("change", []);
            }
        };
        this.setChecked = (date, checked) => {
            const dateArr = () => {
                if (Array.isArray(date) && date.every((v) => utils_1.isDateType(v))) {
                    return date;
                }
                return [date || ""];
            };
            let items = dateArr().map((v) => utils_1.getDateTimestamp(v, true));
            const isDayType = typeof date === "number" && Number.isInteger(date) && date <= 6;
            const shouldPush = (flag) => checked || (checked === undefined && flag);
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
        this.getCalendar = () => ({
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
        const names = ["日", "一", "二", "三", "四", "五", "六"];
        const arr = names.map((name, index) => ({ name, value: index }));
        const [year, month] = utils_1.dateToArray(current || new Date());
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
}
exports.default = CalendarStore;
