console.clear();

function dayCounter(start, end) {
  let workdays = 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

  const difference = Math.round(Math.abs((startDate - endDate) / oneDay)) + 1;

  let curDate = startDate;
  while (curDate <= endDate) {
    let dayOfWeek = curDate.getDay();
    if (!(dayOfWeek === 6 || dayOfWeek === 0)) workdays++;
    curDate.setDate(curDate.getDate() + 1);
  }
  const weekend_days = difference - workdays;
  return [difference, workdays, weekend_days];
}

function holidayCounter() {
  let holidaysJSON = fs.readFileSync("./holidays.json", "utf-8");
  let holidaysObject = JSON.parse(holidaysJSON);
  let numberOfHolidays = holidaysObject.holidays.length;
  let holidaysDates = [];

  for (let holiday of holidaysObject.holidays) holidaysDates.push(holiday.date);

  return [holidaysDates, numberOfHolidays];
}

function dateCheck(check, from, to = from) {
  from = new Date(from);
  to = new Date(to);
  if (check.length <= 5)
    //* if year is not inserted
    check = new Date(new Date(check).setFullYear(from.getFullYear()));
  else check = new Date(check);

  // from = Date.parse(from); // starts from 01/01/1900
  // to = Date.parse(to);
  // check = Date.parse(check);

  if (arguments.length === 2)
    if (from.getYear() === check.getYear())
      if (from.getMonth() === check.getMonth())
        return from.getDate() === check.getDate() ? true : false;

  if (from.getYear() <= check.getYear() && check.getYear() <= to.getYear()) {
    if (from.getMonth() < check.getMonth() && check.getMonth() < to.getMonth())
      return true;
    if (from.getMonth() === check.getMonth())
      return from.getDate() <= check.getDate() ? true : false;
    if (to.getMonth() === check.getMonth())
      return to.getDate() >= check.getDate() ? true : false;
  }
  return false;
}

let fs = require("fs");
let jsonString = fs.readFileSync("./level4/data.json", "utf-8");
let data = JSON.parse(jsonString);


let calendar_workdays = {};
let calendar_Year = [];
let i = 0;

let start = new Date("2017-03-31");
let end = new Date("2017-05-31");

const [holidaysDates] = holidayCounter();

day_Loop: for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
  calendar_Year[i] = {};
  calendar_Year[i].date = new Date(day)
    .toISOString()
    .replace("-", "/")
    .split("T")[0]
    .replace("-", "/");
  calendar_Year[i].status = "workday";

  if (day.getDay() === 0 || day.getDay() === 6) {
    calendar_Year[i].status = "weekend";
  }

  for (let holiday of holidaysDates) {
    holiday = new Date(
      new Date(holiday).setFullYear(new Date(start).getFullYear())
    );
    //* to correct the hour and one day off
    holiday = new Date(
      holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
    );

    if (dateCheck(holiday, day)) {
      calendar_Year[i].status = "holiday";
    }
  }

  i++;
}

project_loop: for (let project of data.projects) {
  start = new Date(project.since);
  end = new Date(project.until);

  i = 0;
  let p = `project${project.id}`;

  day_Loop2: for (let day = start; day <= end; day.setDate(day.getDate() + 1)) {
    // calendar_workdays[`${p}`] = {};
    calendar_workdays[`${p}`] = [];
    calendar_workdays[`${p}`].date = new Date(day)
      .toISOString()
      .replace("-", "/")
      .split("T")[0]
      .replace("-", "/");
    // console.log(calendar_workdays);

    // calendar_workdays[`${p}`].s = "hi";

    if (day.getDay() === 0 || day.getDay() === 6) continue day_Loop2;

    for (let holiday of holidaysDates) {
      holiday = new Date(
        new Date(holiday).setFullYear(new Date(start).getFullYear())
      );
      holiday = new Date(
        holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
      );

      if (dateCheck(holiday, day)) continue day_Loop2;
    }

    i++;
  }
}

console.log(calendar_workdays);

let output = {};
output.dates = calendar_workdays;

fs.writeFileSync(
  "./level4/calendar of the year.json",
  JSON.stringify(calendar_Year, null, 2)
);
// fs.writeFileSync(
//   "./level4/calendar_workdays.json",
//   JSON.stringify(calendar_workdays, null, 2)
// );

// console.log(
//   new Date("1,22,2012").toISOString().replace("-", "/").split("T")[0].replace("-", "/")
// );

let workall = [],
  dev = {},
  work = {};

work.staff = "number one";
work.name = "nima";
work.calendar = [];

for (let k = 0; k < 3; k++) {
  // dev.date = k;
  // dev.status = k;
  work.calendar.push({ date: k, staff: `developer ${k}` });
}
workall.push(work);

fs.writeFileSync(
  "./level4/calendar_workdays.json",
  JSON.stringify(workall, null, 2)
);
