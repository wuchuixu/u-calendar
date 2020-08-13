"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDateType = exports.getFestival = exports.getDateDay = exports.getMonthDays = exports.getDateTimestamp = exports.dateToArray = exports.dateFomater = exports.paddingLeft = exports.isArray = exports.isPlainObject = void 0;
const obj2str = (o) => Object.prototype.toString.call(o);
const isPlainObject = (o) => obj2str(o) === "[object Object]";
exports.isPlainObject = isPlainObject;
const isArray = (o) => obj2str(o) === "[object Array]";
exports.isArray = isArray;
// 个位数补零
const paddingLeft = (n) => +n > 9 ? String(n) : `0${+n}`;
exports.paddingLeft = paddingLeft;
const dateFomater = (date, format) => {
    let res = "";
    const cur = typeof date === "number" || date instanceof Date
        ? new Date(date)
        : new Date();
    const o = {
        "M+": cur.getMonth() + 1,
        "D+": cur.getDate(),
        "h+": cur.getHours(),
        "m+": cur.getMinutes(),
        "s+": cur.getSeconds(),
        "q+": Math.floor((cur.getMonth() + 3) / 3),
        S: cur.getMilliseconds(),
    };
    if (/(Y+)/.test(format)) {
        res = format.replace(RegExp.$1, `${cur.getFullYear()}`.substr(4 - RegExp.$1.length));
    }
    Object.keys(o).forEach((k) => {
        if (new RegExp(`(${k})`).test(format)) {
            res = res.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length));
        }
    });
    return res;
};
exports.dateFomater = dateFomater;
// '2019-01-17' || '2019/01/17' || '2019,01,17' || Date  =>  [2019, 01, 17, ...]
const dateToArray = (date, padding) => {
    let dates = [];
    if (typeof date === "string") {
        dates = date
            .split(/[^0-9]/)
            .filter((v) => !!v)
            .map((v) => +v);
    }
    else if (typeof date === "number" ||
        date instanceof Date ||
        date === undefined) {
        const d = date ? new Date(date) : new Date();
        dates = [
            d.getFullYear(),
            d.getMonth() + 1,
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds(),
        ];
    }
    else if (Array.isArray(date)) {
        dates = date;
    }
    if (padding) {
        return dates.map((v) => paddingLeft(v));
    }
    return dates.map((v) => String(v));
};
exports.dateToArray = dateToArray;
// 获取时间戳
// getDateTimestamp([2019, 1, 1]) => 1546272000000 or getTimestamp(['2019', '01', '01', '00', '00']) => 1546272000000
// getTimestamp('2019年1月1日') => 1546272000000 or getTimestamp('2019年01月01日 00:00:00') => 1546272000000
// getTimestamp('2019-1-1') => 1546272000000 or getTimestamp('2019-01-01 00:00:00') => 1546272000000
// getTimestamp('2019/1/1') => 1546272000000 or getTimestamp('2019/01/01 00:00:00') => 1546272000000
// getTimestamp('2019,1,1') => 1546272000000 or getTimestamp('2019,01,01 00:00:00') => 1546272000000
const getDateTimestamp = (date, ignoreTime) => {
    const [y, M = "01", D = "01", h = "00", m = "00", s = "00"] = dateToArray(date, true);
    if (ignoreTime) {
        return new Date(`${y}/${M}/${D} 00:00:00`).getTime();
    }
    return new Date(`${y}/${M}/${D} ${h}:${m}:${s}`).getTime();
};
exports.getDateTimestamp = getDateTimestamp;
// 获取某月的天数
const getMonthDays = (date) => {
    const [y, M] = dateToArray(date);
    return new Date(+y, +M, 0).getDate();
};
exports.getMonthDays = getMonthDays;
// 获取某天是星期几
const getDateDay = (date) => {
    const timestamp = getDateTimestamp(date);
    return new Date(timestamp).getDay();
};
exports.getDateDay = getDateDay;
const getFestival = (date) => {
    const day = dateFomater(getDateTimestamp(date), "MMDD");
    const maps = {
        "0101": "元旦",
        "0214": "情人节",
        "0308": "妇女节",
        "0312": "植树节",
        "0315": "消费者权益日",
        "0401": "愚人节",
        "0405": "清明节",
        "0501": "劳动节",
        "0504": "青年节",
        "0512": "护士节",
        "0601": "儿童节",
        "0701": "建党节",
        "0801": "建军节",
        "0910": "教师节",
        "0928": "孔子诞辰",
        "1001": "国庆节",
        "1006": "老人节",
        "1024": "联合国日",
        "1224": "平安夜",
        "1225": "圣诞节",
    };
    return maps[day] || "";
};
exports.getFestival = getFestival;
const isDateType = (date) => {
    if (date instanceof Date ||
        (typeof date === "number" && Number.isInteger(date) && date > 86400000) ||
        (typeof date === "string" &&
            date.split(/[^0-9]/).filter((v) => !!v).length > 2) ||
        (Array.isArray(date) && date.every((v) => +v >= 0 && +v < 10000))) {
        return true;
    }
    return false;
};
exports.isDateType = isDateType;
