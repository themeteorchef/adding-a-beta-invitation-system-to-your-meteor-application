Meteor.methods({
  validateBetaToken( user ) {
    check( user, {
      email: String,
      password: Object,
      betaToken: String
    });

    let invite = Invites.findOne( { email: user.email, token: user.betaToken }, { fields: { "_id": 1 } } );

    if ( invite ) {
      let userId = Accounts.createUser( { email: user.email, password: user.password } );

      Roles.addUsersToRoles( userId, 'tester' );

      Invites.update( invite._id, {
        $set: { accountCreated: true },
        $unset: { token: "" }
      });
    } else {
      throw new Meteor.Error( 'bad-match', 'Hmm, this token doesn\'t match your email. Try again?' );
    }
  }
});
