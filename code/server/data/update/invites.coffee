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
        # Use Server Side Rendering to compile our email template and pass it
        # the data we'll need to share with our user. First we compile our
        # template using the .compileTemplate() method, passing the text of our
        # email template located in our /private/email directory.
        SSR.compileTemplate('sendInvite', Assets.getText('email/send-invite.html'))

        # Next, we render and assign data to our compiled template.
        emailTemplate = SSR.render('sendInvite',
          token: token
          url: url
          urlWithToken: url + "/#{token}"
        )

        # If no errors, send the user an email with their invitation.
        Email.send(
          to: invitee.email
          from: "Urkelforce Beta Invitation <dididothat@urkelforce.com>"
          subject: "Welcome to the Urkelforce Beta!"
          html: emailTemplate
        )
    )
)
