const express = require("express");
const menusRouter = express.Router();
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

const menuItemsRouter = require("./menu-items");
menusRouter.use("/:menuId/menu-items", menuItemsRouter);

menusRouter.param("menuId", (req, res, next, menuId) => {
  db.get(`SELECT * FROM Menu WHERE id = ${menuId}`, (err, menu) => {
    if (err) {
      next(err);
    } else if (menu) {
      req.menu = menu;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menusRouter.get("/", (req, res, next) => {
  db.all(`SELECT * FROM Menu`, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({ menus: menus });
    }
  });
});

menusRouter.post("/", (req, res, next) => {
  const newMenu = req.body.menu;
  if (!newMenu.title) {
    return res.sendStatus(400);
  }

  db.run(
    `INSERT INTO Menu (title) 
        VALUES ($title)`,
    {
      $title: newMenu.title
    },
    function(err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
          if (err) {
            next(err);
          } else {
            res.status(201).json({ menu: menu });
          }
        });
      }
    }
  );
});

menusRouter.get("/:menuId", (req, res, next) => {
  res.status(200).json({ menu: req.menu });
});

menusRouter.put("/:menuId", (req, res, next) => {
  const putMenu = req.body.menu;
  if (!putMenu.title) {
    return res.sendStatus(400);
  }

  db.run(
    `UPDATE Menu SET title = $title
     WHERE id = ${req.params.menuId}`,
    {
      $title: putMenu.title
    },
    err => {
      if (err) {
        next(err);
      } else {
        db.get(
          `SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
          (err, menu) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ menu: menu });
            }
          }
        );
      }
    }
  );
});

menusRouter.delete("/:menuId", (req, res, next) => {
  db.get(
    `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
    (err, menuItem) => {
      if (err) {
        next(err);
      } else if (menuItem) {
        return res.sendStatus(400);
      } else {
        db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, err => {
          if (err) {
            next(err);
          } else {
            res.sendStatus(204);
          }
        });
      }
    }
  );
});

module.exports = menusRouter;
