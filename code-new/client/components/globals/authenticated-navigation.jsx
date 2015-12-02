AuthenticatedNavigation = React.createClass({
  mixins: [ ReactMeteorData ],
  getMeteorData() {
    let user = Meteor.user();

    return {
      currentUserId: user._id,
      currentUserEmail: user.emails[ 0 ].address
    };
  },
  items() {
    let items = [
      { name: 'dashboard', path: '/dashboard', label: 'Dashboard' }
    ];

    if ( Roles.userIsInRole( this.data.currentUserId, 'admin' ) ) {
      items.push( { name: 'invites', path: '/invites', label: 'Invites' } );
    }

    return items;
  },
  logout( event ) {
    event.preventDefault();
    return Meteor.logout( () => FlowRouter.go( '/login' ) );
  },
  render() {
    return <Navbar>
      <NavbarItems>
        { this.items().map( ( item, index ) => {
          return <li key={ `authenticated-nav-item_${ index }` } className={ FlowHelpers.currentRoute( item.name ) }>
            <a href={ item.path }>{ item.label }</a>
          </li>;
        })}
      </NavbarItems>
      <NavbarItems position="navbar-right">
        <li className="dropdown">
          <a href="#" className="user-profile-toggle dropdown-toggle clearfix" data-toggle="dropdown">
            { this.data.currentUserEmail }
            <span className="caret"></span>
          </a>
          <ul className="dropdown-menu" role="menu">
            <li><a href="/preferences">Account Preferences</a></li>
            <li className="logout" onClick={ this.logout }><a href="#">Logout</a></li>
          </ul>
        </li>
      </NavbarItems>
    </Navbar>;
  }
});
