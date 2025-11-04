/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // remove field
  collection.fields.removeById("text370448595")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number370448595",
    "max": null,
    "min": null,
    "name": "card",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text370448595",
    "max": 0,
    "min": 0,
    "name": "card",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // remove field
  collection.fields.removeById("number370448595")

  return app.save(collection)
})
