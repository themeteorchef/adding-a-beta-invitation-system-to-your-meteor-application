App = React.createClass({
  mixins: [ ReactMeteorData ],
  getMeteorData() {
    return {
      loggingIn: Meteor.loggingIn(),
      hasUser: !!Meteor.user(),
      currentUser: Meteor.user(),
      isPublic( route ) {
        let publicRoutes = [ 'login', 'signup', 'index' ];
        return publicRoutes.indexOf( route ) > -1;
      },
      isAdmin( route ) {
        let adminRoutes = [ 'invites' ];
        return adminRoutes.indexOf( route ) > -1;
      },
      canView() {
        let currentRoute = FlowRouter.current().route.name,
            isPublic     = this.isPublic( currentRoute ),
            isAdmin      = this.isAdmin( currentRoute ),
            userIsAdmin  = Roles.userIsInRole( Meteor.userId(), 'admin' );

        if ( isAdmin && !userIsAdmin ) {
          return false;
        } else {
          return isPublic || !!Meteor.user();
        }
      }
    };
  },
  loading() {
    return <div className="loading"></div>;
  },
  getView() {
    if ( this.data.canView() ) {
      return this.props.yield;
    } else {
      return this.data.hasUser ? <Dashboard /> : <Login />;
    }
  },
  render() {
    return <div className="app-root">
      <AppHeader hasUser={ this.data.hasUser } />
      <div className="container">
        { this.data.loggingIn ? this.loading() : this.getView() }
      </div>
    </div>;
  }
});
