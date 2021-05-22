const path = require("path");
const express = require("express");
const xss = require("xss");
const ItemService = require("./items-service");

const itemRouter = express.Router();
const jsonParser = express.json();

//filter out the response to avoid showing broken data
const serializeItem = (item) => ({
  id: item.id,
  user_id: item.user_id,
  keyword: xss(item.keyword),
  category: xss(item.category),
  rating: item.rating,
  cost: item.cost,
  currency: xss(item.currency),
  language: xss(item.language),
  type: xss(item.type),
  notes: xss(item.notes),
  is_public: item.is_public,
});

itemRouter
  .route("/")
  //relevant
  .get((req, res, next) => {
    //connect to the service to get the data
    ItemService.getItems(req.app.get("db"))
      .then((items) => {
        //map the results to get each one of the objects and serialize them
        res.json(items.map(serializeItem));
      })
      .catch(next);
  })
  //relevant
  .post(jsonParser, (req, res, next) => {
    //take the input from the user
    const {
      user_id,
      keyword,
      category,
      rating,
      cost,
      currency,
      language,
      type,
      notes,
      is_public,
    } = req.body;
    const newItem = {
      user_id,
      keyword,
      category,
      rating,
      cost,
      currency,
      language,
      type,
      notes,
      is_public,
    };

    //validate the input
    for (const [key, value] of Object.entries(newItem)) {
      if (value == null) {
        //if there is an error show it
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`,
          },
        });
      }
    }

    //save the input in the db
    ItemService.insertItem(req.app.get("db"), newItem)
      .then((item) => {
        res
          //display the 201 status code
          .status(201)
          //redirect the request to the original url adding the item id for editing
          .location(path.posix.join(req.originalUrl, `/${item.id}`))
          //return the serialized results
          .json(serializeItem(item));
      })
      .catch(next);
  });

itemRouter
  .route("/public")
  .all((req, res, next) => {
    //connect to the service to get the data
    ItemService.getPublicItems(req.app.get("db"))
      .then((item) => {
        if (!item) {
          //if there is an error show it
          return res.status(404).json({
            error: {
              message: `Item doesn't exist`,
            },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //get each one of the objects from the results
    res.json(res.item);
  });

itemRouter
  .route("/:item_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.item_id))) {
      //if there is an error show it
      return res.status(404).json({
        error: {
          message: `Invalid id`,
        },
      });
    }

    //connect to the service to get the data
    ItemService.getItemById(req.app.get("db"), req.params.item_id)
      .then((item) => {
        if (!item) {
          //if there is an error show it
          return res.status(404).json({
            error: {
              message: `Item doesn't exist`,
            },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //get each one of the objects from the results and serialize them
    res.json(serializeItem(res.item));
  })
  //relevant
  .patch(jsonParser, (req, res, next) => {
    //take the input from the user
    const {
      user_id,
      keyword,
      category,
      rating,
      cost,
      currency,
      language,
      type,
      notes,
      is_public,
    } = req.body;
    const itemToUpdate = {
      user_id,
      keyword,
      category,
      rating,
      cost,
      currency,
      language,
      type,
      notes,
      is_public,
    };

    //validate the input by checking the length of the itemToUpdate object to make sure that we have all the values
    const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      //if there is an error show it
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title' or 'completed'`,
        },
      });
    }

    //save the input in the db
    ItemService.updateItem(req.app.get("db"), req.params.item_id, itemToUpdate)
      .then((updatedItem) => {
        //get each one of the objects from the results and serialize them
        res.status(200).json(serializeItem(updatedItem));
      })
      .catch(next);
  })
  //relevant
  .delete((req, res, next) => {
    ItemService.deleteItem(req.app.get("db"), req.params.item_id)
      .then((numRowsAffected) => {
        //check how many rows are effected to figure out if the delete was successful
        res.status(204).json(numRowsAffected).end();
      })
      .catch(next);
  });

itemRouter
  .route("/user/:user_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.user_id))) {
      //if there is an error show it
      return res.status(404).json({
        error: {
          message: `Invalid id`,
        },
      });
    }

    //connect to the service to get the data
    ItemService.getItemByUserId(req.app.get("db"), req.params.user_id)
      .then((item) => {
        if (!item) {
          //if there is an error show it
          return res.status(404).json({
            error: {
              message: `Item doesn't exist`,
            },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //get each one of the objects from the results
    res.json(res.item);
  });

module.exports = itemRouter;
