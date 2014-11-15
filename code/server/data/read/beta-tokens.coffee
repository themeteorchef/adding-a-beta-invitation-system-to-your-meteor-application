###
  Beta Tokens
  Collection of methods for handling beta tokens.
###

Meteor.methods(

  validateBetaToken: (user)->
    # Check the email and token arguments against our expected patterns.
    # Note: we're using two check's here because we've passed our arguments
    # as individual variables as opposed to a single object or array.
    check(user,{email: String, password: String, betaToken: String})

    # Attempt to find a user with a matching email and token.
    testInvite = Invites.findOne({email: user.email, token: user.betaToken}, {fields: {"_id": 1, "email": 1, "token": 1}})

    # If the email and token do not match, throw an error. If the email and
    # token do match, invalidate the token by deleting it and return true. We
    # also want to flag the invite as having an account created.
    if not testInvite
      throw new Meteor.Error "bad-match", "Hmm, this token doesn't match your email. Try again?"
    else
      # Create the user's account.
      # Create the user's account.
      id = Accounts.createUser(
        email: user.email
        password: user.password
      )

      # Once the user account is created, set their role to tester. This is
      # optional, but good if you want to segment user accounts during your
      # testing phase (e.g. being able to give admins and testers access to
      # different parts of the application).
      Roles.addUsersToRoles(id, ['tester'])

      # Remove the token from our invite so it cannot be used again.
      Invites.update(testInvite._id,
        $set:
          accountCreated: true
        $unset:
          token: ""
      )
      # Return true so our method completes.
      true
)
