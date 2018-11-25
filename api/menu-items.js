const express = require("express");
const menuItemsRouter = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

menuItemsRouter.param("menuId", (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      // req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.param("menuItemId", (req, res, next, menuItemId) => {
  db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (menuItem) {
      //   req.timesheet = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get("/", (req, res, next) => {
  db.all(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).json({ menuItems: menuItems });
      }
    }
  );
});

menuItemsRouter.post("/", (req, res, next) => {
  const newMenuItem = req.body.menuItem;
  if (
    !newMenuItem.name ||
    !newMenuItem.description ||
    !newMenuItem.inventory ||
    !newMenuItem.price
  ) {
    return res.sendStatus(400);
  }

  db.run(
    `INSERT INTO MenuItem (name, description, inventory, price, menu_id) 
          VALUES ($name, $description, $inventory, $price, ${
            req.params.menuId
          })`,
    {
      $name: newMenuItem.name,
      $description: newMenuItem.description,
      $inventory: newMenuItem.inventory,
      $price: newMenuItem.price
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
          (err, menuItem) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ menuItem: menuItem });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.put("/:menuItemId", (req, res, next) => {
  const putMenuItem = req.body.menuItem;
  if (
    !putMenuItem.name ||
    !putMenuItem.description ||
    !putMenuItem.inventory ||
    !putMenuItem.price
  ) {
    return res.sendStatus(400);
  }

  db.run(
    `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory,
     price = $price WHERE id = ${req.params.menuItemId}`,
    {
      $name: putMenuItem.name,
      $description: putMenuItem.description,
      $inventory: putMenuItem.inventory,
      $price: putMenuItem.price
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
          (err, menuItem) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ menuItem: menuItem });
            }
          }
        );
      }
    }
  );
});

menuItemsRouter.delete("/:menuItemId", (req, res, next) => {
  db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, err => {
    if (err) {
      next(err);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
