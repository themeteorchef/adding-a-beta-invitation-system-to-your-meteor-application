Router.route('index',
  path: '/'
  template: 'index'
  onBeforeAction: ->
    Session.set 'currentRoute', 'index'
    @next()
)

Router.route('signup',
  path: '/signup'
  template: 'signup'
  onBeforeAction: ->
    Session.set 'currentRoute', 'signup'
    # Clear out the beta token on the /signup route without a token parameter
    # so if we switch from /signup/:token, the token doesn't copy over.
    Session.set 'betaToken', ''
    @next()
)

Router.route('signup/:token',
  path: '/signup/:token'
  template: 'signup'
  onBeforeAction: ->
    Session.set 'currentRoute', 'signup'
    # Tell Iron Router to look at our :token parameter and assign it to a
    # session variable so that we can access it in our template.
    Session.set 'betaToken', @params.token
    @next()
)

Router.route('login',
  path: '/login'
  template: 'login'
  onBeforeAction: ->
    Session.set 'currentRoute', 'login'
    @next()
)

Router.route('recover-password',
  path: '/recover-password'
  template: 'recoverPassword'
  onBeforeAction: ->
    Session.set 'currentRoute', 'recover-password'
    @next()
)

Router.route('reset-password',
  path: '/reset-password/:token'
  template: 'resetPassword'
  onBeforeAction: ->
    Session.set 'currentRoute', 'reset-password'
    Session.set 'resetPasswordToken', @params.token
    @next()
)
