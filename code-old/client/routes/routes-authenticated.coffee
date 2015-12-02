Router.route('dashboard',
  path: '/dashboard'
  template: 'dashboard'
  onBeforeAction: ->
    Session.set 'currentRoute', 'dashboard'
    @next()
)

Router.route('invites',
  path: '/invites'
  template: 'invites'
  waitOn: ->
    Meteor.subscribe '/invites'
  onBeforeAction: ->
    Session.set 'currentRoute', 'invites'
    @next()
)
