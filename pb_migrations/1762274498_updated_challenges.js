/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_879072730",
    "hidden": false,
    "id": "relation590033292",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "game",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // remove field
  collection.fields.removeById("relation590033292")

  return app.save(collection)
})
