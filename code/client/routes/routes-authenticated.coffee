Router.route('dashboard',
  path: '/dashboard'
  template: 'dashboard'
  onBeforeAction: ->
    # Code to run before route goes here.
    @next()
)

Router.route('invites',
  path: '/invites'
  template: 'invites'
  onBeforeAction: ->
    # Code to run before route goes here.
    @next()
)
