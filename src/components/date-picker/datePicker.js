/* eslint-disable react/require-default-props */
import React from 'react';
import { View, ViewPropTypes } from 'react-native';
import PropTypes from 'prop-types';
import defaultLocale from './locale/en_US';
import cnLocale from './locale/zh_CN';
import Picker from '../picker-view';

const DATETIME = 'datetime';
const DATE = 'date';
const TIME = 'time';
const MONTH = 'month';
const YEAR = 'year';
const ONEDAY = 24 * 60 * 60 * 1000;

function plusZero(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

const formatColArray = (arrLength, min, labelLocal, isPlusZero) => {
  return Array.from(Array(arrLength), (v, k) => {
    const fianlLabelLocal = `${labelLocal || ''}`;
    const finalLabelMain = isPlusZero ? `${plusZero(k + min)}` : `${k + min}`;
    const label = `${finalLabelMain}${fianlLabelLocal}`;
    return { value: `${k + min}`, label };
  });
};
// get how many days
const getDaysInMonth = date => (
  new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
);

const setMonth = (date, month) => {
  const days = getDaysInMonth(new Date(date.getFullYear(), month));
  date.setDate(Math.min(date.getDate(), days));
  date.setMonth(month);
};

class DatePicker extends React.Component {
  static propTypes = {
    locale: PropTypes.string,
    mode: PropTypes.string,
    use12Hours: PropTypes.bool,
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
    onDateChange: PropTypes.func,
    onValueChange: PropTypes.func,
    isAmpmFirst: PropTypes.bool,
    date: PropTypes.object,
    defaultDate: PropTypes.object,
    style: ViewPropTypes.style,
  };

  static defaultProps = {
    mode: DATE,
    use12Hours: false,
    isAmpmFirst: false,
    locale: 'en',
    minDate: new Date(2000, 0, 1, 0, 0, 0),
    maxDate: new Date(2030, 11, 31, 23, 59, 59),
    onDateChange: () => {},
    onValueChange: () => {}
    // disabled: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      date: props.date || props.defaultDate,
    };
    this.locale = props.locale === 'cn' ? cnLocale : defaultLocale;
  }

  componentWillReceiveProps(nextProps) {
    if ('date' in nextProps) {
      this.setState({ date: nextProps.date || nextProps.defaultDate });
    }
  }

  onValueChange = (value, index, key) => {
    const newValue = this.getNewDate(value, index, key);
    if (!('date' in this.props)) {
      this.setState({ date: newValue });
    }
    if (this.props.onDateChange) {
      this.props.onDateChange(newValue);
    }
    if (this.props.onValueChange) {
      this.props.onValueChange(value, index);
    }
  }

  // get now date
  getDate() {
    return this.getRealDate(this.state.date || this.props.minDate);
  }

  getRealHour(hour) {
    if (this.props.use12Hours) {
      let resultHours = hour;
      if (hour === 0) {
        resultHours = 12;
      }
      if (hour > 12) {
        resultHours -= 12;
      }
      return resultHours;
    }
    return hour;
  }

  setHours(date, hour) {
    if (this.props.use12Hours) {
      const dh = date.getHours();
      let nhour = hour;
      nhour = dh >= 12 ? hour + 12 : hour;
      nhour = nhour >= 24 ? 0 : nhour;
      date.setHours(nhour);
    } else {
      date.setHours(hour);
    }
  }

  setAmPm(date, index) {
    if (index === 0) {
      date.setTime(+date - ONEDAY / 2);
    } else {
      date.setTime(+date + ONEDAY / 2);
    }
  }

  getNewDate = (values, index, key) => {
    const value = parseInt(values, 10);
    const { mode } = this.props;
    const newValue = new Date(this.getDate());
    if (mode === DATETIME || mode === DATE || mode === YEAR || mode === MONTH) {
      switch (key) {
        case 'year':
          newValue.setFullYear(value);
          break;
        case 'month':
          setMonth(newValue, value - 1);
          break;
        case 'day':
          newValue.setDate(value);
          break;
        case 'hour':
          this.setHours(newValue, value);
          break;
        case 'minute':
          newValue.setMinutes(value);
          break;
        case 'ampm':
          this.setAmPm(newValue, value);
          break;
        default:
          break;
      }
    } else if (mode === TIME) {
      switch (key) {
        case 'hour':
          this.setHours(newValue, value);
          break;
        case 'minute':
          newValue.setMinutes(value);
          break;
        case 'ampm':
          this.setAmPm(newValue, value);
          break;
        default:
          break;
      }
    }
    return this.getRealDate(newValue);
  }
  // get time data
  getTimeColsData = date => {
    let minMinute = 0;
    let maxMinute = 59;
    let minHour = 0;
    let maxHour = 23;
    const { mode, use12Hours, isAmpmFirst, minDate, maxDate } = this.props;
    const { locale } = this;
    const minDateMinute = minDate.getMinutes();
    const maxDateMinute = maxDate.getMinutes();
    const minDateHour = minDate.getHours();
    const maxDateHour = maxDate.getHours();
    const nowHour = date.getHours();
    if (mode === DATETIME) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const minDateYear = minDate.getFullYear();
      const maxDateYear = maxDate.getFullYear();
      const minDateMonth = minDate.getMonth();
      const maxDateMonth = maxDate.getMonth();
      const minDateDay = minDate.getDate();
      const maxDateDay = maxDate.getDate();
      if (minDateYear === year && minDateMonth === month && minDateDay === day) {
        minHour = minDateHour;
        if (minDateHour === nowHour) {
          minMinute = minDateMinute;
        }
      }
      if (maxDateYear === year && maxDateMonth === month && maxDateDay === day) {
        maxHour = maxDateHour;
        if (maxDateHour === nowHour) {
          maxMinute = maxDateMinute;
        }
      }
    } else {
      minHour = minDateHour;
      if (minDateHour === nowHour) {
        minMinute = minDateMinute;
      }
      maxHour = maxDateHour;
      if (maxDateHour === nowHour) {
        maxMinute = maxDateMinute;
      }
    }
    let ampmCols = [];
    // todo: minDate and maxDate
    if (use12Hours) {
    //   let ampm = [];
    //   if (minHour > 12 && maxHour > 12) {
    //     ampm.push({ value: '1', label: locale.pm })
    //   } else if (minHour <= 12 && maxHour <= 12) {
    //     ampm.push({ value: '0', label: locale.am })
    //   } else {
    //     ampm = [{ value: '0', label: locale.am }, { value: '1', label: locale.pm }];
    //   }
      const ampm = [{ value: '0', label: locale.am }, { value: '1', label: locale.pm }];
      ampmCols = [{ key: 'ampm', values: ampm }];
    }
    let hour = [];
    if (minHour === 0 && maxHour === 0 || minHour !== 0 && maxHour !== 0) {
      minHour = this.getRealHour(minHour);
    } else if (minHour === 0 && use12Hours) {
      minHour = 1;
      hour.push({ value: '0', label: locale.hour ? `12${locale.hour}` : '12' });
    }
    maxHour = this.getRealHour(maxHour);
    const hours = formatColArray(
      maxHour - minHour + 1,
      minHour, locale.hour || '',
      locale.hour,
      true,
    );
    hour = hour.concat(hours);
    const hourCols = { key: 'hour', values: hour };
    const nowMinute = date.getMinutes();
    const minute = formatColArray(
      maxMinute - minMinute + 1,
      minMinute, locale.minute || '',
      locale.minute,
      true
    );
    const minuteCols = { key: 'minute', values: minute };

    const cols = !isAmpmFirst ? [
      hourCols,
      minuteCols,
    ].concat(ampmCols) : ampmCols.concat([hourCols, minuteCols]);
    return { cols, nowMinute, nowHour };
  }

  // get the correct date for pciker
  getRealDate = date => {
    const { mode, minDate, maxDate } = this.props;
    switch (mode) {
      case DATETIME:
        if (date < minDate) {
          return new Date(+minDate);
        }
        if (date > maxDate) {
          return new Date(+maxDate);
        }
        break;
      case TIME:
        {
          const maxHour = maxDate.getHours();
          const maxMinutes = maxDate.getMinutes();
          const minHour = minDate.getHours();
          const minMinutes = minDate.getMinutes();
          const hour = date.getHours();
          const minutes = date.getMinutes();
          if (hour < minHour || hour === minHour && minutes < minMinutes) {
            return new Date(+minDate);
          }
          if (hour > maxHour || hour === maxHour && minMinutes > maxMinutes) {
            return new Date(+maxDate);
          }
        }
        break;
      default:
        if (date >= +maxDate + ONEDAY) {
          return new Date(+maxDate);
        }
        if (+date + ONEDAY <= minDate) {
          return new Date(+minDate);
        }
        break;
    }
    return date;
  }
  // get col data
  getDateColsData = () => {
    const { mode, maxDate, minDate } = this.props;
    const { locale } = this;
    const date = this.getDate();
    const nowYear = date.getFullYear();
    const nowMonth = date.getMonth();
    const maxDateYear = maxDate.getFullYear();
    const minDateYear = minDate.getFullYear();
    const minDateMonth = minDate.getMonth();
    const maxDateMonth = maxDate.getMonth();
    const minDateDay = minDate.getDate();
    const maxDateDay = maxDate.getDate();
    const year = formatColArray(maxDateYear - minDateYear + 1, minDateYear, locale.year);
    const yearCol = { key: 'year', values: year };
    if (mode === YEAR) {
      return [yearCol];
    }

    let minMonth = 0;
    let maxMonth = 11;
    if (minDateYear === nowYear) {
      minMonth = minDateMonth;
    }
    if (maxDateYear === nowYear) {
      maxMonth = maxDateMonth;
    }
    const month = formatColArray(maxMonth - minMonth + 1, minMonth + 1, locale.month, true);
    const monthCol = { key: 'month', values: month };
    if (mode === MONTH) {
      return [yearCol, monthCol];
    }

    let minDay = 1;
    let maxDay = getDaysInMonth(date);
    if (minDateYear === nowYear && minDateMonth === nowMonth) {
      minDay = minDateDay;
    }
    if (maxDateYear === nowYear && maxDateMonth === nowMonth) {
      maxDay = maxDateDay;
    }
    const day = formatColArray(maxDay - minDay + 1, minDay, locale.day, true);
    const dayCol = { key: 'day', values: day };

    return [yearCol, monthCol, dayCol];
  }
  // get picker selectItems and currentValue
  getIndexAndCols = () => {
    const { mode, use12Hours, isAmpmFirst } = this.props;
    const date = this.getDate();
    const cols = [];
    const value = [];

    if (mode === YEAR) {
      return {
        cols: this.getDateColsData(),
        value: [`${date.getFullYear()}`],
      };
    }
    if (mode === MONTH) {
      return {
        cols: this.getDateColsData(),
        value: [`${date.getFullYear()}`, `${date.getMonth() + 1}`]
      };
    }
    if (mode === DATE) {
      return {
        cols: this.getDateColsData(),
        value: [`${date.getFullYear()}`, `${date.getMonth() + 1}`, `${date.getDate()}`],
      };
    }
    const time = this.getTimeColsData(date);
    let realhour = time.nowHour;
    const timeValue = [`${realhour}`, `${time.nowMinute}`];
    if (use12Hours) {
      realhour = time.nowHour === 0 ? 12 : (time.nowHour > 12 ? time.nowHour - 12 : time.nowHour);
      timeValue[0] = `${realhour}`;
      const ampmStr = `${time.nowHour >= 12 ? 1 : 0}`;
      if (isAmpmFirst) {
        timeValue.splice(0, 0, ampmStr);
      } else {
        timeValue.push(ampmStr);
      }
    }
    if (mode === DATETIME) {
      return {
        cols: this.getDateColsData().concat(time.cols),
        value: [
          `${date.getFullYear()}`,
          `${date.getMonth() + 1}`,
          `${date.getDate()}`,
          ...timeValue
        ],
      };
    }
    if (mode === TIME) {
      return {
        cols: time.cols,
        value: [...timeValue]
      };
    }
    return {
      cols,
      value,
    };
  }

  render() {
    const { value, cols } = this.getIndexAndCols();
    const { style } = this.props;
    const multiStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 5,
      paddingRight: 5,
      backgroundColor: '#fff',
      height: 200,
    };
    return (
      <View style={[multiStyle, style]}>
        {
          cols.map((pItem, pindex) => (
            <Picker
              style={{ flex: 1 }}
              key={pItem.key}
              // disabled={disabled}
              // itemStyle={itemStyle}
              selectedValue={value[pindex]}
              onValueChange={date => this.onValueChange(date, pindex, pItem.key)}
            >
              {
                pItem.values.map(item => (
                  <Picker.Item key={`${pItem.key}_${item.value}`} value={item.value} label={item.label} />
                ))
              }
            </Picker>
          ))
        }
      </View>
    );
  }

}

export default DatePicker;
