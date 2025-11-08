/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.is_admin = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_414225205")

  // update collection data
  unmarshal({
    "createRule": null
  }, collection)

  return app.save(collection)
})
