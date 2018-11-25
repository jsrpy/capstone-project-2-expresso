const express = require("express");
const employeesRouter = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const timesheetsRouter = require("./timesheets");
employeesRouter.use("/:employeeId/timesheets", timesheetsRouter);

employeesRouter.param("employeeId", (req, res, next, employeeId) => {
  db.get(`SELECT * FROM Employee WHERE id = ${employeeId}`, (err, employee) => {
    if (err) {
      next(err);
    } else if (employee) {
      req.employee = employee;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

employeesRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM Employee WHERE is_current_employee = 1`,
    (err, employees) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ employees: employees });
      }
    }
  );
});

employeesRouter.post("/", (req, res, next) => {
  const newEmployee = req.body.employee;
  if (!newEmployee.name || !newEmployee.position || !newEmployee.wage) {
    return res.sendStatus(400);
  }

  if (!newEmployee.is_current_employee) {
    newEmployee.is_current_employee = 1;
  }

  db.run(
    `INSERT INTO Employee (name, position, wage, is_current_employee) 
        VALUES ($name, $position, $wage, $is_current_employee)`,
    {
      $name: newEmployee.name,
      $position: newEmployee.position,
      $wage: newEmployee.wage,
      $is_current_employee: newEmployee.is_current_employee
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${this.lastID}`,
          (err, employee) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ employee: employee });
            }
          }
        );
      }
    }
  );
});

employeesRouter.get("/:employeeId", (req, res, next) => {
  res.status(200).json({ employee: req.employee });
});

employeesRouter.put("/:employeeId", (req, res, next) => {
  const putEmployee = req.body.employee;
  if (
    !putEmployee.name ||
    !putEmployee.position ||
    !putEmployee.wage
    //!putEmployee.is_current_employee
  ) {
    return res.sendStatus(400);
  }

  db.run(
    `UPDATE Employee SET name = $name, position = $position, 
     wage = $wage
     WHERE id = ${req.params.employeeId}`,
    {
      $name: putEmployee.name,
      $position: putEmployee.position,
      $wage: putEmployee.wage
    },
    err => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
          (err, employee) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ employee: employee });
            }
          }
        );
      }
    }
  );
});

employeesRouter.delete("/:employeeId", (req, res, next) => {
  db.run(
    `UPDATE Employee SET is_current_employee = 0
         WHERE id = ${req.params.employeeId}`,
    err => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
          (err, employee) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ employee: employee });
            }
          }
        );
      }
    }
  );
});

module.exports = employeesRouter;
