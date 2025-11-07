/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "listRule": ""
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "listRule": "@request.query.code = code"
  }, collection)

  return app.save(collection)
})
