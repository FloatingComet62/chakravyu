/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "updateRule": "@request.body.code = code || @request.auth.is_admin = true || @request.auth.id = accepter"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "updateRule": "@request.body.code = code || @request.auth.is_admin = true"
  }, collection)

  return app.save(collection)
})
