Meteor.methods({
  addToInvitesList( email ) {
    check( email, String );

    let emailExists = Invites.findOne( { email: email } ),
        inviteCount = Invites.find( {}, { fields: { _id: 1 } } ).count();

    if ( !emailExists ) {
      return Invites.insert({
        email: email,
        invited: false,
        requested: ( new Date() ).toISOString(),
        token: Random.hexString( 15 ),
        accountCreated: false,
        inviteNumber: inviteCount + 1
      });
    } else {
      throw new Meteor.Error( 'already-invited', 'Sorry, it looks like you\'ve already requested an invite! Hang tight :)' );
    }
  }
});
