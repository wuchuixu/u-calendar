import { DateType, DayType } from "./data.d";

const obj2str = (o: any) => Object.prototype.toString.call(o);
const isPlainObject = (o: any) => obj2str(o) === "[object Object]";
const isArray = (o: any) => obj2str(o) === "[object Array]";

// 个位数补零
const paddingLeft = (n: string | number): string =>
  +n > 9 ? String(n) : `0${+n}`;

const dateFomater = (date: Date | number, format: string) => {
  let res: string = "";
  const cur =
    typeof date === "number" || date instanceof Date
      ? new Date(date)
      : new Date();
  const o: { [key: string]: any } = {
    "M+": cur.getMonth() + 1, // 月份
    "D+": cur.getDate(), // 日
    "h+": cur.getHours(), // 小时
    "m+": cur.getMinutes(), // 分
    "s+": cur.getSeconds(), // 秒
    "q+": Math.floor((cur.getMonth() + 3) / 3), // 季度
    S: cur.getMilliseconds(), // 毫秒
  };
  if (/(Y+)/.test(format)) {
    res = format.replace(
      RegExp.$1,
      `${cur.getFullYear()}`.substr(4 - RegExp.$1.length)
    );
  }

  Object.keys(o).forEach((k) => {
    if (new RegExp(`(${k})`).test(format)) {
      res = res.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      );
    }
  });

  return res;
};

// '2019-01-17' || '2019/01/17' || '2019,01,17' || Date  =>  [2019, 01, 17, ...]
const dateToArray = (date?: DateType, padding?: boolean): string[] => {
  let dates: (string | number)[] = [];

  if (typeof date === "string") {
    dates = date
      .split(/[^0-9]/)
      .filter((v) => !!v)
      .map((v) => +v);
  } else if (
    typeof date === "number" ||
    date instanceof Date ||
    date === undefined
  ) {
    const d = date ? new Date(date as Date) : new Date();
    dates = [
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
    ];
  } else if (Array.isArray(date)) {
    dates = date;
  }

  if (padding) {
    return dates.map((v) => paddingLeft(v));
  }

  return dates.map((v) => String(v));
};

// 获取时间戳
// getDateTimestamp([2019, 1, 1]) => 1546272000000 or getTimestamp(['2019', '01', '01', '00', '00']) => 1546272000000
// getTimestamp('2019年1月1日') => 1546272000000 or getTimestamp('2019年01月01日 00:00:00') => 1546272000000
// getTimestamp('2019-1-1') => 1546272000000 or getTimestamp('2019-01-01 00:00:00') => 1546272000000
// getTimestamp('2019/1/1') => 1546272000000 or getTimestamp('2019/01/01 00:00:00') => 1546272000000
// getTimestamp('2019,1,1') => 1546272000000 or getTimestamp('2019,01,01 00:00:00') => 1546272000000
const getDateTimestamp = (date?: DateType, ignoreTime?: boolean) => {
  const [y, M = "01", D = "01", h = "00", m = "00", s = "00"] = dateToArray(
    date,
    true
  );

  if (ignoreTime) {
    return new Date(`${y}/${M}/${D} 00:00:00`).getTime();
  }

  return new Date(`${y}/${M}/${D} ${h}:${m}:${s}`).getTime();
};

// 获取某月的天数
const getMonthDays = (date?: DateType): number => {
  const [y, M] = dateToArray(date);
  return new Date(+y, +M, 0).getDate();
};

// 获取某天是星期几
const getDateDay = (date?: DateType) => {
  const timestamp = getDateTimestamp(date);
  return new Date(timestamp).getDay() as DayType;
};

const getFestival = (date?: DateType): string => {
  const day = dateFomater(getDateTimestamp(date), "MMDD");
  const maps: { [key: string]: any } = {
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

const isDateType = (date: DateType): boolean => {
  if (
    date instanceof Date ||
    (typeof date === "number" && Number.isInteger(date) && date > 86400000) ||
    (typeof date === "string" &&
      date.split(/[^0-9]/).filter((v) => !!v).length > 2) ||
    (Array.isArray(date) && date.every((v) => +v >= 0 && +v < 10000))
  ) {
    return true;
  }
  return false;
};

export {
  isPlainObject,
  isArray,
  paddingLeft,
  dateFomater,
  dateToArray,
  getDateTimestamp,
  getMonthDays,
  getDateDay,
  getFestival,
  isDateType,
};
