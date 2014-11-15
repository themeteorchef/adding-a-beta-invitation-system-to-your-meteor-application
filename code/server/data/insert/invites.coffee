###
  Invites
  Collection of methods for inserting documents into the Invites collection.
###

Meteor.methods(

  addToInvitesList: (invitee) ->
    # Check the invitee argument against our expected pattern.
    check(invitee, {email: String, requested: Number, invited: Boolean})

    # Validate that the email we're passing does not already exist. We're doing
    # this on the server to guarantee that we're not doing any double inserts.
    # If we find the email does exist, throw an error.
    emailExists = Invites.findOne({"email": invitee.email})

    if emailExists
      throw new Meteor.Error "email-exists", "It looks like you've already signed up for our beta. Thanks!"
    else
      # Enumerate the invite so we know what order it came in. This ties back to
      # our "number in line" concept on the index page. Here we take the invitee
      # object passed as an argument to our method and append a new inviteNumber
      # key with a value equal to the number of existing invites plus one.
      inviteCount = Invites.find({},{fields: {"_id": 1}}).count()
      invitee.inviteNumber = inviteCount + 1

      # Perform the insert into our DB.
      Invites.insert(invitee, (error)->
        console.log error if error
      )
)
