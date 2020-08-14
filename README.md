# u-calendar
Create calendar class only

## useage

### first step:
``` sh
npm install u-calendar --save
```

### Second step:
``` js
import UCalendar from "u-calendar";

const calendar = new UCalendar(options);

```

### examples

#### react

> Calendar.tsx

``` tsx
import React, { useState, useEffect, memo, forwardRef, useImperativeHandle } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Checkbox } from 'antd';
import { CheckboxProps } from 'antd/es/checkbox';
import classnames from 'classnames';
import UCalendar from 'u-calendar';
import {
  CalendarInstance,
  CalendarProps,
  WeekCell,
  DateType,
  DateCell,
  DayType,
} from 'u-calendar/src/data.d';
import { getDateTimestamp, dateFomater } from 'u-calendar/src/utils';
import styles from './index.less';

interface ICalendarProps extends CalendarProps {
  value?: DateType;
  className?: string;
  from?: CalendarInstance;
  toolbarActions?: React.ReactNode | React.ReactNode[];
  onDateChange?: (payload: { year: string; month: string; dates: DateCell[] }) => void;
  onChange?: (value?: DateType) => void;
  onCellClick?: (cell: DateCell, index: number) => void;
  showMonthCheckbox?: boolean;
  showWeekCheckbox?: boolean;
  toolbarRender?: (currentYear: string, currentMonth: string) => React.ReactNode;
  headerRender?: (payload: WeekCell, index: number) => React.ReactNode;
  cellRender?: (cell: DateCell, index: number, rows: DateCell[]) => React.ReactNode;
}

function useCalendar(from?: CalendarInstance, optons?: CalendarProps): [CalendarInstance] {
  const formRef = React.useRef<CalendarInstance>();

  if (!formRef.current) {
    if (from) {
      formRef.current = from;
    } else {
      const calendar = new UCalendar(optons || {});

      formRef.current = calendar.getCalendar();
    }
  }

  return [formRef.current];
}

const SpanCell: React.FC<CheckboxProps> = ({ children }) => <span>{children}</span>;

const Calendar: React.ForwardRefRenderFunction<any, ICalendarProps> = (props, ref: any) => {
  const {
    className,
    from,
    toolbarActions,
    toolbarRender,
    headerRender,
    cellRender,
    showMonthCheckbox,
    showWeekCheckbox,
    onCellClick,
    onChange,
    onDateChange,
    ...rest
  } = props;
  const [checkedValues, setCheckedValues] = useState<number[]>([]);
  const [dates, setDates] = useState<DateCell[]>([]);
  const [currentYear, setCurrentYear] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [calendar] = useCalendar(from, rest);
  const { weekCells, dateCells, checkeds, currentYear: curYear, currentMonth: curMonth } = calendar;

  useImperativeHandle(ref, () => ({
    clearChecked: () => {
      calendar.clearChecked();
    },
  }));
  const ToolbarCheckbox = showMonthCheckbox ? Checkbox : SpanCell;
  const HeaderCheckbox = showWeekCheckbox ? Checkbox : SpanCell;

  const isAllChecked = (day?: DayType) => {
    const items = dates
      .filter((v) => !v.disabled && v.inView && (day === undefined || day === v.day))
      .map((v) => v.timestamp);
    if (items.length && items.every((v) => checkedValues.includes(v))) {
      return true;
    }
    return false;
  };

  const isEqualArray = (arr: number[], newArr: number[]): boolean => {
    if (arr.length === newArr.length && arr.every((v, i) => v === newArr[i])) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    setDates([...dateCells]);
    setCurrentYear(curYear);
    setCurrentMonth(curMonth);
    setCheckedValues([...checkeds]);
  }, []);

  useEffect(() => {
    if (rest.value === undefined) {
      calendar.clearChecked();
    }
    if (rest.value) {
      calendar.clearChecked();
      const vals = calendar.setChecked(rest.value, true);
      if (!isEqualArray(checkedValues, vals)) {
        setCheckedValues([...vals]);
      }
    }
  }, [rest.value]);

  useEffect(() => {
    calendar.on('change', (data) => {
      setCheckedValues([...data]);
      if (typeof onChange === 'function') {
        const vals = [...data].map((v) => dateFomater(v, rest.valueFormat || 'YYYY-MM-DD'));
        onChange(rest.maxChecked === 1 ? vals.join(',') : vals);
      }
    });
    return () => {
      calendar.off('change');
    };
  }, [onChange]);

  useEffect(() => {
    calendar.on('dateChange', ({ dateCells: datas, year, month }) => {
      setCurrentYear(year);
      setCurrentMonth(month);
      setDates([...datas]);
      if (typeof onDateChange === 'function') {
        onDateChange({ year, month, dates: datas });
      }
    });
    return () => {
      calendar.off('dateChange');
    };
  }, [onDateChange]);

  return (
    <div className={classnames([styles.calendar, className])} ref={ref}>
      <div className="calendar-toolbar">
        <LeftOutlined className="btn prev" onClick={() => calendar.prev()} />
        {toolbarRender ? (
          toolbarRender(currentYear, currentMonth)
        ) : (
          <div className="calendar-toolbar-con">
            {toolbarActions}
            <span>{currentYear}</span>
            <span>年</span>
            <span>{currentMonth}</span>
            <span>月</span>
            <ToolbarCheckbox
              checked={isAllChecked()}
              onChange={(e) => {
                const { checked } = e.target;
                calendar.setChecked(undefined, checked);
              }}
              style={{ marginLeft: 10 }}
            >
              {showMonthCheckbox ? '全月' : ''}
            </ToolbarCheckbox>
          </div>
        )}
        <RightOutlined className="btn next" onClick={() => calendar.next()} />
      </div>
      <ul className="calendar-header">
        {weekCells.map((item, index) => {
          return (
            <li key={item.value}>
              {headerRender ? (
                headerRender(item, index)
              ) : (
                <HeaderCheckbox
                  checked={isAllChecked(item.value)}
                  onChange={(e) => {
                    const { checked } = e.target;
                    calendar.setChecked(item.value, checked);
                  }}
                >
                  {item.name}
                </HeaderCheckbox>
              )}
            </li>
          );
        })}
      </ul>
      <ul className="calendar-body">
        {dates.map((v, i) => {
          return (
            <li
              className={classnames([
                'calendar-cell',
                {
                  'is-other': !v.inView,
                  'is-disabled': v.disabled,
                  'is-checked': checkedValues.includes(v.timestamp),
                  'is-today': v.timestamp === getDateTimestamp(new Date(), true),
                },
              ])}
              key={v.value}
              onClick={() => {
                if (v.disabled) {
                  return;
                }
                if (v.inView) {
                  calendar.setChecked(v.timestamp);
                }
                if (typeof onCellClick === 'function') {
                  onCellClick(v, i);
                }
              }}
            >
              <div className="calendar-cell-box">
                <div className="calendar-cell-date">{v.date}</div>
                <div className="calendar-cell-con">
                  {cellRender ? cellRender(v, i, dates) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default memo(forwardRef(Calendar));

```

#### vue

> Calendar.vue

``` vue
<template name="calendar">
  <div :class="['calendar', className]">
    <ul class="calendar-hd">
      <li v-for="week in weekCells" :key="week.value" class="cell week-cell">{{ week.name }}</li>
    </ul>
    <ul class="calendar-bd">
      <li
        v-for="(item, index) in dates"
        :key="item.timestamp"
        :class="[
          'cell date-cell',
          {
            indiv: item.indiv,
            disabled: item.disabled,
            checked: checkeds.includes(item.timestamp)
          }
        ]"
        @tap="onCellClick(item, index)"
      >
        <slot :cell="item" :checked="checkeds.includes(item.timestamp)">
          <div>{{ item.date }}</div>
        </slot>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";
import UCalendar from 'u-calendar';
import { dateFomater } from "u-calendar/src/utils";
import {
  CalendarInstance,
  DateType,
  DateCell,
  WeekCell,
  DayType,
} from "u-calendar/src/data.d";

let calendar: CalendarInstance;

@Component
export default class Calendar extends Vue {
  @Prop() private className?: string;
  @Prop() private current?: DateType;
  @Prop() private value?: DateType | DateType[];
  @Prop() private defaultValue?: DateType | DateType[];
  @Prop() private maxChecked?: number;
  @Prop() private disabled?: boolean;
  @Prop({ default: "YYYY-MM-DD" }) private valueFormat!: string;
  @Prop() private startWeek?: DayType;
  @Prop() private disabledDate?: (currentDate: DateCell) => boolean;
  @Prop() private customCells?: PlainObject[];

  weekCells: WeekCell[] = [];
  dateCells: DateCell[] = [];
  checkeds: number[] = [];

  @Watch("current")
  onCurrentChange(nv: DateType) {
    if (calendar) {
      this.dateCells = calendar.setCurrent(nv);
    }
  }

  private get dates() {
    const arr = this.dateCells.map((v) => {
      const item = { ...v };
      const custom =
        this.customCells?.find((v) => v.value === item.value) || {};
      const cur = { ...item, ...custom };
      if (typeof this.disabledDate === "function") {
        cur.disabled = this.disabledDate(cur);
      }
      return cur;
    });
    return arr;
  }

  init() {
    const calendar = new UCalendar(this.$props || {}).getCalendar();

    this.weekCells = calendar.weekCells;
    this.dateCells = calendar.dateCells;
    this.checkeds = calendar.checkeds;

    calendar.on("change", () => {
      const vals = this.checkeds.map((v) => dateFomater(v, this.valueFormat));
      const val = this.maxChecked === 1 ? vals[0] : vals;
      this.$emit("update:value", val);
      this.$emit("change", val);
    });

    calendar.on("dateChange", (data) => {
      this.$emit("dateChange", data);
    });
  }

  @Emit("onCellTap")
  onCellClick(cell: DateCell, index: number) {
    if (cell.disabled || this.disabled) return;
    calendar.setChecked(
      cell.timestamp,
      this.maxChecked === 1 ? true : undefined
    );
    return { cell, index };
  }

  created() {
    this.init();
  }

  destroyed() {
    if (calendar) {
      calendar.off("change");
      calendar.off("dateChange");
    }
  }
}
</script>

<style lang="less">
@import "./index.less";
</style>

```