/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "updateRule": "@request.body.code = code"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "updateRule": null
  }, collection)

  return app.save(collection)
})
