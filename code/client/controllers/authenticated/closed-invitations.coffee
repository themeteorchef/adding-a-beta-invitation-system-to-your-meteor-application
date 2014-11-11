Template.closedInvitations.helpers(

  hasInvites: ->
    getInvites = Invites.find({invited: true}, {fields: "_id": 1, "invited": 1}).fetch()
    if getInvites.length > 0 then true else false

  invites: ->
    Invites.find({invited: true}, {sort: {dateInvited: -1}},{fields: {"_id": 1, "inviteNumber": 1, "email": 1, "token": 1, "dateInvited": 1, "invited": 1, "accountCreated": 1}})

)
