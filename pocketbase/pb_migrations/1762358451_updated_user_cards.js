/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = user_id || @request.auth.is_admin = true",
    "updateRule": "@request.auth.is_admin = true",
    "viewRule": "@request.auth.id = user_id || @request.auth.is_admin = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // update collection data
  unmarshal({
    "listRule": "@request.auth.id = user_id",
    "updateRule": null,
    "viewRule": "@request.auth.id = user_id"
  }, collection)

  return app.save(collection)
})
