Template.signupCount.helpers(

  inviteCount: ->
    # Subscribe to invite count publication.
    Meteor.subscribe 'inviteCount'
    # Get total number of invites. Here, we only ask for the _id field because
    # we're counting, not looking for data (a traditional Invites.find({}) would
    # return all keys/values for each document and would be overkill).
    inviteTotal = Invites.find({}, {fields: {"_id": 1}}).count()
    # Test the value of inviteTotal and return the appropriate value and string
    # to display in the template.
    switch
      when inviteTotal == 1 then "1 person has already signed up!"
      when inviteTotal > 1 then "#{inviteTotal} people have already signed up!"
      else false
)
