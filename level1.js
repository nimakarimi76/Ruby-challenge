console.clear();
let fs = require("fs");

//! const input1 = fs.readFileSync("./level1/data.json", "utf-8");
// console.log(input1);

fs.readFile("./level1/data.json", "utf-8", (err, jsonString) => {
  if (err) console.log(err);
  else {
    try {
      let data = JSON.parse(jsonString);
      // console.log(data);

      let since = []; //* mm/dd/yyyy
      let until = []; // mm/dd/yyyy
      let availabilities = [];

      for (let period of data.periods) {
        since[period.id - 1] = [];
        since[period.id - 1].push(period.since.slice(5, 7));
        since[period.id - 1].push(period.since.slice(8));
        since[period.id - 1].push(period.since.slice(0, 4));

        until[period.id - 1] = [];
        until[period.id - 1].push(period.until.slice(5, 7));
        until[period.id - 1].push(period.until.slice(8));
        until[period.id - 1].push(period.until.slice(0, 4));
      }

      for (let period of data.periods) {
        availabilities[period.id - 1] = {};
        availabilities[period.id - 1].period_id = period.id;

        const [total, workdays, weekand_days] = dayCounter(
          since[period.id - 1],
          until[period.id - 1]
        );

        availabilities[period.id - 1].total_days = total;
        availabilities[period.id - 1].workdays = workdays;
        availabilities[period.id - 1].weekend_days = weekand_days;
        availabilities[period.id - 1].holidays = 0;

        const [holidaysDates, numberOfHolidays] = holidayCounter();

        for (let holiday of holidaysDates) {
          if (dateCheck(holiday, period.since, period.until)) {
            availabilities[period.id - 1].holidays++;

            //* Let's change the holiday to the currect year
            holiday = new Date(
              new Date(holiday).setFullYear(
                new Date(period.since).getFullYear()
              )
            );

            //* To correct the hour and one day off
            holiday = new Date(
              holiday.getTime() + Math.abs(holiday.getTimezoneOffset() * 60000)
            );

            //* Is it on the workdays?
            if (!(holiday.getDay() === 0 || holiday.getDay() === 6))
              availabilities[period.id - 1].workdays--;
          }
        }
      }
      let output = {};
      output.availabilities = availabilities;

      fs.writeFileSync(
        "./level1/myOutput.json",
        JSON.stringify(output, null, 1)
      );
    } catch (err) {
      console.log("We faced an error", err);
    }
  }
});

function dayCounter(start, end) {
  let workdays = 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds

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

// if (dateCheck("05-01", "2017-03-11", "2017-05-15")) console.log("Availed");
// else console.log("Not Availed");

function dateCheck(check, from, to = from) {
  //* if there wasn't any 'to' consider 'to' equal to 'from'

  from = new Date(from);
  to = new Date(to);

  if (check.length <= 5)
    //* if year is not inserted
    check = new Date(new Date(check).setFullYear(from.getFullYear()));
  else check = new Date(check);

  // from = Date.parse(from); // starts from 01/01/1900
  // to = Date.parse(to);
  // check = Date.parse(check);

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

//? example of one day delay
// var doo = new Date("09-24");
// console.log(doo)
// console.log(
//   new Date(doo.getTime() + Math.abs(doo.getTimezoneOffset() * 60000))
// );
