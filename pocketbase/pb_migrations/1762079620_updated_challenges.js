/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "listRule": "@request.query.code = code",
    "updateRule": "@request.query.code = code",
    "viewRule": "@request.query.code = code"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "listRule": "@request.body.code = code",
    "updateRule": "@request.body.code = code",
    "viewRule": "@request.body.code = code"
  }, collection)

  return app.save(collection)
})
