export const createDateTimeFormatter = (timeZone: string): Intl.DateTimeFormat =>
  new Intl.DateTimeFormat("en-AU", { dateStyle: "long", timeStyle: "short", timeZone });

export const localDateTime = (date: Date): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

export const isFutureLocalTime = (value: string): boolean => {
  const date = new Date(value);
  return date.getTime() > Date.now() && localDateTime(date) === value;
};
