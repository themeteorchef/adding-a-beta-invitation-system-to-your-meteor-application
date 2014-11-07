Template.openInvitations.helpers(

  hasInvites: ->
    getInvites = Invites.find({invited: false}, {fields: "_id": 1, "invited": 1}).fetch()
    if getInvites.length > 0 then true else false

  invites: ->
    Invites.find({invited: false}, {sort: {"requested": 1}}, {fields: {"_id": 1, "requested": 1, "email": 1, "invited": 1}})

)

Template.openInvitations.events(

  'click .send-invite': ->
    invitee =
      id: this._id
      email: this.email

    confirmInvite = confirm "Are you sure you want to invite #{this.email}?"

    if confirmInvite
      Meteor.call 'sendInvite', invitee, (error)->
        if error
          console.log error
        else
          alert "Invite sent to #{invitee.email}!"
)
