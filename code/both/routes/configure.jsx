FlowRouter.notFound = {
  action() {
    ReactLayout.render( App, { yield: <NotFound /> } );
  }
};

Accounts.onLogin( () => {
  let currentRoute = FlowRouter.current(),
      path         = currentRoute ? currentRoute.path : '/dashboard';

  return path !== '/login' ? FlowRouter.go( path ) : FlowRouter.go( '/dashboard' );
});
