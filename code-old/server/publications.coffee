###
  Publications
  Define Meteor publications to subscribe to on the client.
###

Meteor.publish '/invites', ->
  # Return list of invites if current user is admin.
  if Roles.userIsInRole(this.userId, ['admin'])
    Invites.find({}, {fields: {"_id": 1, "inviteNumber": 1, "requested": 1, "email": 1, "token": 1, "dateInvited": 1, "invited": 1, "accountCreated": 1}})

Meteor.publish 'inviteCount', ->
  # Return list of invites with ID only.
  Invites.find({}, {fields: {"_id": 1}})
