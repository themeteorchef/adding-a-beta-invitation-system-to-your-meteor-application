Template.index.rendered = ->
  # Initialize jQuery validation on our invite request form.
  $('#request-beta-invite').validate(
    rules:
      emailAddress:
        email: true
        required: true
    messages:
      emailAddress:
        email: "Please use a valid email address."
        required: "An email address is required to get your invite."
    submitHandler: ->
      # We'll make use of jQuery Validation's submitHandler function to
      # handle the "submission" of our form, calling to the server side
      # method creating the actual invite.

      # Get our invitee's email from the template. Because we're handling this
      # in our validation's submitHandler, instead of calling on the template
      # to find the input, we'll use a call to jQuery.
      invitee =
        email: $('[name="emailAddress"]').val().toLowerCase()
        invited: false
        requested: ( new Date() ).getTime()

      # Call the addToInvitesList method on the server.
      Meteor.call 'addToInvitesList', invitee, (error,response) ->
        if error
          alert error.reason
        else
          alert "Invite requested. We'll be in touch soon. Thanks for your interest in Urkelforce!"
  )

Template.index.events(

  'submit form': (e)->
    e.preventDefault()

)
