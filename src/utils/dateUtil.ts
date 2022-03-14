/**
 * Independent time operation tool to facilitate subsequent switch to dayjs
 */
import moment from 'moment';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_TIME_FORMAT_NOS = 'YYYY-MM-DD HH:mm';
const DATE_FORMAT = 'YYYY-MM-DD';

export function formatToDateTime(
  date: moment.MomentInput = undefined,
  format = DATE_TIME_FORMAT,
): string {
  return moment(date).format(format);
}

export function formatToDate(date: moment.MomentInput = undefined, format = DATE_FORMAT): string {
  return moment(date).format(format);
}

/**
 * 获取一天得时长
 * @returns 一天得时长
 */
export function getDaySpan(): number {
  return 1000 * 60 * 60 * 24;
}

/**
 * 获取一周时长
 * @returns
 */
export function getWeekSpan(): number {
  return 1000 * 60 * 60 * 24 * 7;
}

/**
 * 获取一小时时长
 * @returns
 */
export function getHourSpan(): number {
  return 1000 * 60 * 60;
}

/**
 * 获取中文的星期几
 * @param day
 * @returns
 */
export function getDayCN(day): string {
  switch (day) {
    case 1:
      return '星期一';
    case 2:
      return '星期二';
    case 3:
      return '星期三';
    case 4:
      return '星期四';
    case 5:
      return '星期五';
    case 6:
      return '星期六';
    case 0:
      return '星期日';
    default:
      return '星期日';
  }
}

export const dateUtil = moment;
