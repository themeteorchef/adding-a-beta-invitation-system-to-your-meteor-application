###
  Publications
  Define Meteor publications to subscribe to on the client.
###

Meteor.publish '/invites', ->
  # Return list of invites if current user is admin.
  if Roles.userIsInRole(this.userId, ['admin'])
    Invites.find({}, {fields: {"_id": 1, "email": 1, "inviteToken.public": 1, "inviteToken.private": 1, "dateInvited": 1, "invited": 1, "accountCreated": 1}})
