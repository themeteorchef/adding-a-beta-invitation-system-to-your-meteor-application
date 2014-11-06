###
  Invites
  Collection of methods for inserting documents into the Invites collection.
###

Meteor.methods(

  addToInvitesList: (invitee) ->
    # Check the invitee argument against our expected pattern.
    check(invitee, {email: String, requested: Number, invited: Boolean})

    # Perform the insert into our DB.
    Invites.insert(invitee, (error)->
      console.log error if error
    )
)
