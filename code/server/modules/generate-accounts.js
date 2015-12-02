let administrators = [
  {
    name: { first: 'Steve', last: 'Urkel' },
    email: 'steve@urkel.com',
    password: 'dididothat'
  }
];

let generateAccounts = () => {
  let usersExist = _checkIfAccountsExist( administrators.length );

  if ( !usersExist ) {
    _createUsers( administrators );
  }
};

let _checkIfAccountsExist = ( count ) => {
  let userCount = Meteor.users.find().count();
  return userCount < count ? false : true;
};

let _createUsers = ( users ) => {
  for ( let i = 0; i < users.length; i++ ) {
    let user       = users[ i ],
        userExists = _checkIfUserExists( user.email );

    if ( !userExists ) {
      _createUser( user );
    }
  }
};

let _checkIfUserExists = ( email ) => {
  return Meteor.users.findOne( { 'emails.address': email } );
};

let _createUser = ( user ) => {
  let userId = Accounts.createUser({
    email: user.email,
    password: user.password,
    profile: {
      name: user.name
    }
  });

  Roles.addUsersToRoles( userId, 'admin' );
};

Modules.server.generateAccounts = generateAccounts;
