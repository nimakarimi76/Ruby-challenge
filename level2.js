console.clear();
let fs = require("fs");

fs.readFile("./level2/data.json", "utf-8", (err, jsonString) => {
  if (err) console.log(err);
  else {
    try {
      let data = JSON.parse(jsonString);

      let availabilities = [];
      let i = 0;
      for (let period of data.periods) {
        for (let developer of data.developers) {
          availabilities[i] = {};
          availabilities[i].developer_id = developer.id;
          availabilities[i].period_id = period.id;

          const [total, workdays, weekand_days] = dayCounter(
            period.since,
            period.until
          );

          availabilities[i].total_days = total;
          availabilities[i].workdays = workdays;
          availabilities[i].weekend_days = weekand_days;
          availabilities[i].holidays = 0;

          const [holidaysDates, numberOfHolidays] = holidayCounter();

          for (let holiday of holidaysDates) {
            if (dateCheck(holiday, period.since, period.until)) {
              availabilities[i].holidays++;
              holiday = new Date(
                new Date(holiday).setFullYear(
                  new Date(period.since).getFullYear()
                )
              );
              //* to correct the hour and one day off
              holiday = new Date(
                holiday.getTime() +
                  Math.abs(holiday.getTimezoneOffset() * 60000)
              );

              if (!(holiday.getDay() === 0 || holiday.getDay() === 6))
                availabilities[i].workdays--;
            }
          }

          //* convert it to the current year
          let developerBirthday = new Date(
            new Date(developer.birthday).setFullYear(
              new Date(period.since).getFullYear()
            )
          );

          //* check the employees' birthday
          if (dateCheck(developerBirthday, period.since, period.until)) {
            let bd = new Date(developerBirthday).getDay();

            availabilities[i].holidays++;

            // is it on weekend or not?
            if (bd !== 0 && bd !== 6) availabilities[i].workdays--;
          }

          // * check the local holidays
          for (let j = 0; j < data.local_holidays.length; j++) {
            if (
              dateCheck(data.local_holidays[j].day, period.since, period.until)
            ) {
              let patrono = new Date(data.local_holidays[j].day);

              if (patrono.getDay() == 0 || patrono.getDay() == 6)
                availabilities[i].holidays++;
              else {
                availabilities[i].workdays--;
                availabilities[i].holidays++;
              }
            }
          }
          i += 1;
        }
      }

      let output = {};
      output.availabilities = availabilities;
      // console.log(output);

      fs.writeFileSync(
        "./level2/myOutput.json",
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
