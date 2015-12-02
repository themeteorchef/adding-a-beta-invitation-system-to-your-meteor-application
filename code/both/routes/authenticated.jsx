const authenticatedRoutes = FlowRouter.group({
  name: 'authenticated'
});

authenticatedRoutes.route( '/dashboard', {
  name: 'dashboard',
  action() {
    ReactLayout.render( App, { yield: <Dashboard /> } );
  }
});

authenticatedRoutes.route( '/invites', {
  name: 'invites',
  action() {
    ReactLayout.render( App, { yield: <InvitesList /> } );
  }
});
