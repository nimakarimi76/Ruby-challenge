console.clear();

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

const [holidaysDates] = holidayCounter();

let workCalendar = [];
let start = new Date("2017-01-01");
let end = new Date("2017-12-31");

let calendar_Year = [];
let i = 0;

day_Loop: for (
  let day = new Date(start);
  day <= end;
  day.setDate(day.getDate() + 1)
) {
  if (dateCheck(day, new Date("2017-03-26T23:00:00.000Z"))) continue day_Loop;
  calendar_Year[i] = {};
  calendar_Year[i].date = new Date(day).toISOString().split("T")[0];

  calendar_Year[i].status = "workday";

  if (day.getDay() === 0 || day.getDay() === 6)
    calendar_Year[i].status = "weekend";

  //* holidays
  for (let j = 0; j < data.local_holidays.length; j++) {
    let holiday = new Date(data.local_holidays[j].day);

    holiday = new Date(
      holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
    );

    if (dateCheck(holiday, day))
      calendar_Year[i].status = data.local_holidays[j].name;
  }

  for (let holiday of holidaysDates) {
    holiday = new Date(
      new Date(holiday).setFullYear(new Date(start).getFullYear())
    );

    // * to correct the hour and one day off
    holiday = new Date(
      holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
    );

    if (dateCheck(holiday, day)) calendar_Year[i].status = "holiday";
  }

  i++;
}

fs.writeFileSync(
  "./level4/calendar of the year.json",
  JSON.stringify(calendar_Year, null, 2)
);

for (let developer of data.developers) {
  workCalendar.push({
    ID: developer.id,
    name: developer.name,
    calendar: [],
  });

  day_Loop2: for (
    let day = new Date(start);
    day <= end;
    day.setDate(day.getDate() + 1)
  ) {
    if (day.getDay() === 0 || day.getDay() === 6) continue day_Loop2;

    //* holidays
    for (let j = 0; j < data.local_holidays.length; j++)
      if (dateCheck(data.local_holidays[j].day, day)) continue day_Loop2;

    for (let holiday of holidaysDates) {
      holiday = new Date(
        new Date(holiday).setFullYear(new Date(start).getFullYear())
      );
      holiday = new Date(
        holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
      );
      if (dateCheck(holiday, day)) continue day_Loop2;
    }

    workCalendar[developer.id - 1].calendar.push({
      date: new Date(day).toISOString().split("T")[0],
    });
  }
}

let numberOfProjects = 0;
const effort_days = [];
const projectStart = [];
const projectEnd = [];
let projectCompletion = [];

for (let project of data.projects) {
  effort_days[project.id - 1] = project.effort_days;
  projectCompletion.push(0); //* Measuring the progress of the projects

  projectStart.push(project.since);
  projectEnd.push(project.until);
  numberOfProjects++;
}

const numberOfWorkdays = 248;

for (let i = 0; i < numberOfWorkdays; i++) {
  dateLoop: for (let day of workCalendar) {
    let j = numberOfProjects - 1;
    if (effort_days[j] !== 0)
      if2: if (
        dateCheck(day.calendar[i].date, projectStart[j], projectEnd[j])
      ) {
        effort_days[j] = effort_days[j] - 1;
        day.calendar[i].status = `project number ${data.projects[j].id}`;

        projectCompletion[j]++;
        continue dateLoop;
      }

    j--;
    if (effort_days[j] !== 0)
      if1: if (
        dateCheck(day.calendar[i].date, projectStart[j], projectEnd[j])
      ) {
        effort_days[j] = effort_days[j] - 1;
        day.calendar[i].status = `project number ${data.projects[j].id}`;

        projectCompletion[j]++;
        continue dateLoop;
      }

    j--;
    if (effort_days[j] !== 0) {
      effort_days[j] = effort_days[j] - 1;
      day.calendar[i].status = `project number ${data.projects[j].id}`;

      projectCompletion[j]++;
      continue dateLoop;

      // if (effort_days[0] === 0) break iLoop;
    }
  }
}

fs.writeFileSync(
  "./level4/calendar_workdays.json",
  JSON.stringify(workCalendar, null, 2)
);
