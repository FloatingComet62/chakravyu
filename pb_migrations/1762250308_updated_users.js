/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "",
    "updateRule": ""
  }, collection)

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "bool3304254982",
    "name": "is_admin",
    "presentable": true,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "deleteRule": "id = @request.auth.id",
    "updateRule": "id = @request.auth.id"
  }, collection)

  // remove field
  collection.fields.removeById("bool3304254982")

  return app.save(collection)
})
