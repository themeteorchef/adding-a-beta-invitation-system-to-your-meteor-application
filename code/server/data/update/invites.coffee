###
  Invites
  Collection of methods for updating documents in the Invites collection.
###

Meteor.methods(

  sendInvite: (invitee) ->
    # Check the invitee argument against our expected pattern.
    check(invitee,String)

    # Perform the insert into our DB.
    Invites.upsert(invitee,
      $set:
        token: Random.hexString(10)
        dateInvited: ( new Date() ).getTime()
        invited: true
        accountCreated: false
    ,(error)->
      if error
        console.log error
      else
        # Send the user an email with their invitation.
    )
)
