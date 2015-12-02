Meteor.publish( 'invites-list', function() {
  if ( Roles.userIsInRole( this.userId, 'admin' ) ) {
    return Invites.find();
  }
});
