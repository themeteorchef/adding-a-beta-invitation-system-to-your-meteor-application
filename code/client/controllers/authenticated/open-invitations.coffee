Template.openInvitations.helpers(

  hasInvites: ->
    getInvites = Invites.find({invited: false}, {fields: "_id": 1, "invited": 1}).count()
    if getInvites > 0 then true else false

  invites: ->
    Invites.find({invited: false}, {sort: {"requested": 1}}, {fields: {"_id": 1, "inviteNumber": 1, "requested": 1, "email": 1, "invited": 1}})

)

Template.openInvitations.events(

  'click .send-invite': ->
    # Define our invitee's data.
    invitee =
      id: @_id
      email: @email

    # Grab the current URL the request is being made from to use in our email.
    url = window.location.origin + "/signup"

    # Make sure we want to do this before moving forward.
    confirmInvite = confirm "Are you sure you want to invite #{this.email}?"

    if confirmInvite
      Meteor.call 'sendInvite', invitee, url, (error)->
        if error
          console.log error
        else
          alert "Invite sent to #{invitee.email}!"
)
