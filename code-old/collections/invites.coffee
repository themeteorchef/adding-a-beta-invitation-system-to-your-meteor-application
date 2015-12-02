@Invites = new Meteor.Collection 'invites'

Invites.allow
  insert: ->
    # Prevent any client-side data insertion.
    false
  update: ->
    # Prevent any client-side data updates.
    false
  remove: ->
    # Prevent any client-side data removal.
    false
