/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = receiver || @request.auth.is_admin = true",
    "deleteRule": "@request.auth.id = receiver || @request.auth.is_admin = true",
    "listRule": "@request.auth.is_admin = true",
    "updateRule": "@request.body.code = code || @request.auth.is_admin = true",
    "viewRule": "@request.auth.is_admin = true"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_4177893232")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id = receiver",
    "deleteRule": "@request.auth.id = receiver",
    "listRule": "",
    "updateRule": "@request.body.code = code",
    "viewRule": ""
  }, collection)

  return app.save(collection)
})
