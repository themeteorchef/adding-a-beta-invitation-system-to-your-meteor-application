Template.closedInvitations.helpers(

  hasInvites: ->
    getInvites = Invites.find({"invited": true}, {fields: "_id": 1, "invited": 1})
    if getInvites.length > 0 then true else false

  invites: ->
    Invites.find({"invited": true}, {fields: {"_id": 1, "email": 1, "inviteToken.public": 1, "dateInvited": 1, "invited": 1, "accountCreated": 1}})

)
