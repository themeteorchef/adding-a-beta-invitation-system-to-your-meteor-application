###
  Invites
  Collection of methods for reading documents in the Invites collection.
###

Meteor.methods(

  countInvites: ->
    Invites.find({}, {fields: {"_id": 1}}).count()
)
