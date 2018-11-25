const express = require("express");
const timesheetsRouter = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

timesheetsRouter.param("employeeId", (req, res, next, employeeId) => {
  db.get(
    `SELECT * FROM Timesheet WHERE employee_id = ${employeeId}`,
    (err, timesheet) => {
      if (err) {
        next(err);
      } else if (timesheet) {
        req.employee = employee;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

timesheetsRouter.param("timesheetId", (req, res, next, timesheetId) => {
  db.get(
    `SELECT * FROM Timesheet WHERE id = ${timesheetId}`,
    (err, timesheet) => {
      if (err) {
        next(err);
      } else if (timesheet) {
        req.timesheet = timesheet;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  );
});

timesheetsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Timesheet 
     WHERE employee_id = ${req.params.employeeId}`,
    (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ timesheets: timesheets });
      }
    }
  );
});

timesheetsRouter.post("/", (req, res, next) => {
  const postTimesheet = req.body.timesheet;
  if (!postTimesheet.hours || !postTimesheet.rate || !postTimesheet.date) {
    return res.sendStatus(400);
  }

  db.run(
    `INSERT INTO Timesheet (hours, rate, date, employee_id) 
        VALUES ($hours, $rate, $date, $employee_id)`,
    {
      $hours: postTimesheet.hours,
      $rate: postTimesheet.rate,
      $date: postTimesheet.date,
      $employee_id: req.params.employeeId
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
          (err, timesheet) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ timesheet: timesheet });
            }
          }
        );
      }
    }
  );
});

timesheetsRouter.put("/:timesheetId", (req, res, next) => {
  const putTimesheet = req.body.timesheet;
  if (!putTimesheet.hours || !putTimesheet.rate || !putTimesheet.date) {
    return res.sendStatus(400);
  }

  db.run(
    `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date
     WHERE id = ${req.params.timesheetId} AND employee_id = ${
      req.params.employeeId
    }`,
    {
      $hours: putTimesheet.hours,
      $rate: putTimesheet.rate,
      $date: putTimesheet.date
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
          (err, timesheet) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ timesheet: timesheet });
            }
          }
        );
      }
    }
  );
});

timesheetsRouter.delete("/:timesheetId", (req, res, next) => {
  db.run(`DELETE FROM Timesheet WHERE id = ${req.params.timesheetId}`, err => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;
