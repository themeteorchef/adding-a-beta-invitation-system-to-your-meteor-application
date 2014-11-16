###
  Invites
  Collection of methods for updating documents in the Invites collection.
###

Meteor.methods(

  sendInvite: (invitee,url) ->
    # Check the invitee and url arguments against our expected patterns.
    check(invitee,{id: String, email: String})
    check(url,String)

    # Generate a token here so we can use it with our email, too.
    token = Random.hexString(10)

    # Update our user.
    Invites.update(invitee.id,
      $set:
        token: token
        dateInvited: ( new Date() ).getTime()
        invited: true
        accountCreated: false
    ,(error)->
      if error
        console.log error
      else
        # If no errors, send the user an email with their invitation.
        Email.send(
          to: invitee.email
          from: "The Meteor Chef <business@themeteorchef.com>"
          subject: "Welcome to Urkelforce!"
          html: Handlebars.templates['send-invite'](
            token: token
            url: url
            urlWithToken: url + "/#{token}"
          )
        )
    )
)
