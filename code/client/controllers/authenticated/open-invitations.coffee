Template.openInvitations.helpers(

  hasInvites: ->
    getInvites = Invites.find({"invited": false}, {fields: "_id", "invited": 1})
    if getInvites.length > 0 then true else false

  invites: ->
    Invites.find({"invited": false}, {fields: {"_id": 1, "email": 1, "invited": 1}})

)
