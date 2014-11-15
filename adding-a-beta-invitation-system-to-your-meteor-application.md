<div class="note">
<h3>A quick note</h3>
<p>The demo for this recipe is currently offline. There was an issue deploying to meteor.com in conjunction with the meteorhacks:ssr package used in this recipe. The recipe <em>does</em> work locally, however, so for the moment you will need to <a href="https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application">clone a copy from GitHub</a> and run a server locally. Sorry for the inconvenience! Make sure to follow <a href="http://twitter.com/themeteorchef">@themeteorchef on Twitter</a> for updates.</p>
</div>

### Getting Started

This recipe relies on a handful of packages to give us some extra functionality that we'll use to issue beta invites to our users. Before we jump in, let's get each installed and take a look at what functionality they'll give us access to.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add alanning:roles
```

The [Roles package](https://atmospherejs.com/alanning/roles) gives us the ability to specify different "types" of users in our application. In this recipe, we'll use Roles to create two types of users: "testers" and "admins."

<p class="block-header">Terminal</p>
```.lang-bash
meteor add random
```

The [Random package](https://atmospherejs.com/meteor/random) is an official package offered by the Meteor Development Group to assist in the generation of random numbers and hexidecimal values. We'll rely on this package to help us generate beta tokens for Urkelforce's beta testers.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add meteorhacks:ssr
```

[SSR](https://atmospherejs.com/meteorhacks/ssr) is a package by Arunoda (of [Meteor Hacks](http://meteorhacks.com)) that gives us the ability to render templates on the server. We'll use this to render our HTML email template with data to send to Urkelforce's beta invitees.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add email
```

The [Email package](http://docs.meteor.com/#/full/email) is another package offered by the Meteor Development Group that gives us the ability to send email from our application. We'll use this to handle the delivery of our beta invitation email.

<p class="block-header">Terminal</p>
```.lang-bash
meteor add mrt:moment
```

Last but not least, the [Moment package](https://atmospherejs.com/mrt/moment) gives us access to the [moment.js library](http://momentjs.com/) for creating human-readable date and time strings. We'll use this for a UX touch in our invite admin panel for displaying when an invite was requested.

<div class="note">
  <h3>A quick note</h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included</a> list for Base to ensure you have fulfilled all of the dependencies.</p>  
</div>

### Setting Up Routes & Filtering

To get our beta invitation system up and running, we'll need to define a few routes in our application. Before we jump in, here's what we need:

- A route where users from the public can signup to get an invite.
- A route where users from the public can create their account once they've received a beta token.
- A route where administrators can see a list of requested invites and manually invite new users.
- A route where administrators can see a list of invites that have been sent along with their redemption status/
- An example area where we can send our beta testers _after_ they've created an account.

You'll notice that we have two distinct areas in our application: a public side that _anyone_ can see and an administrative side that only administrators can see. To handle the flow of traffic, we'll make use of Iron Router's before filters to create some rules for _who_ can gain access to _what_ in our application.

#### Public Routes
First, let's define our routes. We'll start with the public facing routes that _anyone_ can visit:

<p class="block-header">/client/routes/routes-public.coffee</p>
```.lang-coffeescript
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
    Session.set 'betaToken', ''
    @next()
)

Router.route('signup/:token',
  path: '/signup/:token'
  template: 'signup'
  onBeforeAction: ->
    Session.set 'currentRoute', 'signup'
    Session.set 'betaToken', @params.token
    @next()
)
```

In this first set of routes, we start with a definition for our `index` route or `/`. This is where we will be placing our signup form so people who are interested in joining our beta can request an invite.

The next two routes are one in the same, but each have a unique function. The first `signup` route takes our user to our `/signup` page. But notice: we're setting a `Session` variable called `betaToken` to an empty string. Why?

In our next route, `signup/:token` we offer an alternative version of our route that expects a token to be passed. Here, we set the `betaToken` session variable to be equal to the the token being passed to the route. This is accessed by looking at the params object given to us by Iron Router `@params.token`. **Note**: the `@` here is just CoffeeScript shorthand for `this.`.

In our first `/signup` route, we set our `betaToken` to be an empty string so that if our user moves away from our signup page, their token isn't left in the `Session` state. This is a little detail to prevent information from leaking out where it shouldn't.

Combined, this pattern gives Urkelforce's users a better experience. We're ensuring that, even without a token, someone can make it to the `/signup` page without receiving an error. This _does not_ mean, however, that they can signup without a token.

#### Authenticated Routes

Now we want to focus on the routes that user's will get access to once they're logged in.

<p class="block-header">/client/routes/routes-authenticated.coffee</p>
```.lang-coffeescript
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
```

An even simpler version of what we saw above. Here, we simply define two routes: `/dashboard` and `/invites`. The dashboard in this instance is where we'll send Urkelforce's beta testers after they've signed up (this is just for example, you can send your own users wherever you'd like).

Lastly, we have our `/invites` route where we'll display our two lists (using a tab interface) of users who have requested invites and users who have been invited.

Now that we have our routes in place, we need to add a few filters that will control who can access what routes when.

#### Route Filters

To make sure that we're keeping Urkelforce's users from going to route's that they shouldn't, we need to define a few filters and specify when and where those filters should apply.

A filter is nothing more than a function with the specific purpose of checking against a rule and making a decision for where to send the user based on the result of that check. Let's look at our filter functions first, then look at how we need to turn them on.

<p class="block-header">/client/routes/filters.coffee</p>
```.lang-coffeescript
checkUserLoggedIn = ->
  if not Meteor.loggingIn() and not Meteor.user()
    Router.go '/'
  else
    @next()

userAuthenticatedBetaTester = ->
  loggedInUser = Meteor.user()
  isBetaTester = Roles.userIsInRole(loggedInUser, ['tester'])
  if not Meteor.loggingIn() and isBetaTester
    Router.go '/dashboard'
  else
    @next()

userAuthenticatedAdmin = ->
  loggedInUser = Meteor.user()
  isAdmin      = Roles.userIsInRole(loggedInUser, ['admin'])
  if not Meteor.loggingIn() and isAdmin
    Router.go '/invites'
  else
    @next()
```

Each filter above is made up of a simple `if/else` statement. What we want to pay attention to for each is the _condition_ that we’re passing to the filter.

Our first filter is to test whether or not a user is logged in. We use 	`if not Meteor.loggingIn() and not Meteor.user()` to check two things: whether Meteor is in the process of logging in a user or, if a user is already logged in.

We’re doing this in the negative here (`not`) because if both are false (meaning there’s not a running login process and no logged in user), we want to send the user to `/`, or, our index route (i.e. Urkelforce’s beta signup form).

Great! Now, let’s look it our last two filters `userAuthenticatedBetaTester` and `userAuthenticatedAdmin`. Both of these filter functions are identical except for the type of user we’re testing for and where we’re sending them. Let’s review our `userAuthenticatedBetaTester` filter and then assume the same process for our `userAuthenticatedAdmin` filter.

Here, we introduce a new method `Roles.userIsInRole(loggedInUser, ['tester’])` set to a variable of `isBetaTester`. This method is provided by the `alanning:roles` package that we installed at the beginning of the recipe.

This method takes our `loggedInUser` variable (set to `Meteor.user()`) and tests it against a single value array `[‘tester’]`.

When it runs, this method says “look at the current user and see if they have a role of ‘tester’ applied to their account.” In this instance, if the answer is “yes,” we send the user to our `/dashboard` route.

We’re doing the same thing in our last filter instead testing for an `admin` user type and sending any user that’s a positive match to `/invites`.

Now that we’ve defined our functions, let’s take a look at how we actually _apply_ them to specific routes.

<p class="block-header">/client/routes/filters.coffee</p>
```.lang-coffeescript
Router.onBeforeAction checkUserLoggedIn, except: [
  'index',
  'signup',
  'signup/:token',
  'login',
  'recover-password',
  'reset-password'
]

Router.onBeforeAction userAuthenticatedBetaTester, only: [
  'index',
  'signup',
  'signup/:token',
  'login',
  'recover-password',
  'reset-password',
  'invites'
]

Router.onBeforeAction userAuthenticatedAdmin, only: [
  'index',
  'signup',
  'signup/:token',
  'login',
  'recover-password',
  'reset-password'
]
```

Here, we’re making use of Iron Router’s `onBeforeAction` method in a _global_ sense. You’ll notice that when we defined our public and authenticated routers earlier, we used `onBeforeAction` on a _per route_ basis. The differe here is that we’re telling Iron Router to apply these filter functions to _all_ routes. There are a lot of different applications for this, but one that’s particularly handy is checking whether or not to send a user to a specific route.

Looking at our second call to `Router.onBeforeAction`, we’re passing our `userAuthenticatedBetaTester` filter function along with an `only` key that holds an array of strings. The strings in this array are the _only_ routes we want this function be applied to, meaning, the function _will not_ run on any route that isn’t in this list.

Nifty, eh? We can see the reverse of the `only` option `except` being used above, telling Iron Router to apply our `checkUserLoggedIn` filter on _all_ routes _except_ for the given list.

Alright! Our routes are all setup. Next, we’re going to jump into controllers for our templates.

<div class="note">
<h3>A quick note</h3>
<p>We’re going to gloss over the actual templates a bit to save some time and focus just on the code that’s running behind the scenes. If you want to see everything together, make sure to <a href=“https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application”>snag a copy of the source on GitHub</a> and poke around.</p>
</div>

### Accepting Users

With our routes in place we can start getting some data into the database and work toward issuing invites to users interested in joining the Urkelforce beta.

In our index template `/client/views/public/index.html` we have a field where user’s can enter an email address to register for the beta. What we want to do is take that email and create a “placeholder” for them, or in this case, an invite. We’ve already created a collection to store all of this data that you can find in `/collections/invites.coffee`.

#### Index Controller

Our index controller is where we’ll handle two things: validating our user’s email address and when valid, add the user to our beta list. To handle validation, we’re making use of the `themeteorchef:jquery-validation` package that’s included in the source for this recipe (not mentioned above).

To get started, we first need to prevent the submission of our signup form so we can instead defer submission to our validation  (if this is confusing, hang tight, you’ll see how it works shortly). On our template’s `events()` method:

<p class="block-header">/client/controllers/public/index.coffee</p>
```.lang-coffeescript
Template.index.events(
  'submit form': (e)->
    e.preventDefault()
)
```

Here, we’re simply saying when the form in our `index` template is submitted, don’t do anything. With our form submission deferred, we’ll make a call to our `validation()` method in our template’s `rendered` callback function. Let’s look at everything first and then step through it.

<p class="block-header">/client/controllers/public/index.coffee</p>
```.lang-coffeescript
Template.index.rendered = ->
  $('#request-beta-invite').validate(
    rules:
      emailAddress:
        email: true
        required: true
    messages:
      emailAddress:
        email: "Please use a valid email address."
        required: "An email address is required to get your invite."
    submitHandler: ->
      # Code to run after form is valid.
  )
```

A few things going on here. First, we attach our `validate()` method to our form using `$(‘#request-beta-invite').validate()`. With this in place, we pass three settings to the method: `rules`, `messages`, and `submitHandler`. In our first two settings, we specify the name of the field we’d like to “validate” along with the rules we’d like to use. Here we’re saying that an email must be entered and that we want the user to enter a valid email address (i.e. not a bunch of gibberish).

The messages setting here simply takes the rules we’ve setup in the `rules` block and gives us the option to set error messages that will display if the validation fails.

Finally, we set a callback function in the `submitHandler` setting where we’ll actually run our code when our form is “valid.” Let’s look at what we’re doing after the form is validated.

<p class="block-header">/client/controllers/public/index.coffee</p>
```.lang-coffeescript
invitee =
  email: $('[name="emailAddress"]').val().toLowerCase()
  invited: false
  requested: ( new Date() ).getTime()

  Meteor.call 'addToInvitesList', invitee, (error,response) ->
    if error
      alert error.reason
    else
      alert "Invite requested. We'll be in touch soon. Thanks for your interest in Urkelforce!"
```

This is pretty straightforward. We’re using jQuery to get the value our user has passed to the `[name=“emailAddress”]` field (converting the value to lowercase to prevent getting a mixed case value from the user) and then setting two additional values `invited: false` and `requested: ( new Date() ).getTime()`. The `invited: false` key/value is saying that our user has _not_ been invited yet. We’re going to make use of this later on to determine which list our invite should show up on.

Finally, to make things easier on admin’s, we pass a unix timestamp for the current time (when the form is actually submitted) using the `( new Date() ).getTime()` method.

Next, we take all of this and pass it to a method call `addToInvitesList` that we’ll define on the server next. If the method fails or succeeds, we’ll display a popup alert to the user with a message to let them know what’s going on.

Let’s pop over to the server and see how this all ties together.

#### Adding Invites On the Server

On the server recall that we need to define a method called `addToInvitesList` that actually inserts our user’s invite request into the database. Here’s how that looks:

<p class="block-header">/server/data/insert/invites.coffee</p>
```.lang-coffeescript
Meteor.methods(

  addToInvitesList: (invitee) ->
    check(invitee, {email: String, requested: Number, invited: Boolean})

    emailExists = Invites.findOne({“email": newInvitee})

    if emailExists
      throw new Meteor.Error "email-exists", "It looks like you've already signed up for our beta. Thanks!"
    else
      inviteCount = Invites.find({},{fields: {"_id": 1}}).count()
      invitee.inviteNumber = inviteCount + 1

      Invites.insert(invitee, (error)->
        console.log error if error
      )
)
```

First, we make sure to make use of the [Meteor Check package](http://docs.meteor.com/#/full/check_package) to ensure that the data we’re getting from the client is what we actually want. Recall we did this in [Recipe # 1: Exporting Data From Your Meteor Application](http://themeteorchef.com/recipes/exporting-data-from-your-meteor-application/).

Now we take our `invitee.email` value and pass it to a `findOne` call on our `Invites` collection. Setting this to a variable `emailExists`, we use it in an if/else statement that throws an error that will be sent back to the client if the email is found, and if not (it’s unique), insert the user into the database.

Notice that we’ve added two lines of code for checking how many users currently exist in our beta and then incrementing that number by one, adding it to the invite before insert it into the database. This is entirely optional, but a nice way to identify the order in which invites have come in (e.g. if you want to invite older requests first).

Blammo! We can officially take emails from interested users on our index page and add them to our “invites list.” In the next part of this recipe, we’ll look at approving invites, sending an email to the user, and getting their account created using a beta token!

<div class="note">
<h3>A quick note</h3>
<p>Take a break! Do your eyes hurt? Hopefully not. Seriously, though, get up and walk around or go get a snack before we keep going.</p>
</div>

### Sending Invitations

The halfway point! Now we get into some really fun stuff. The next thing we need to accomplish is actually _inviting_ users who have requested an invite. Let’s move over to the `/invites` route where we’ll handle processing our invitations.

Again, we’re going to skip going too far into our template and instead focus on its controller. A quick overview: we’ve split our invitations list into two templates: `/client/views/authenticated/open-invitations.html` and `/client/views/authenticated/closed-invitations.html`, both combined using a tab interface in `/client/views/authenticated/invites.html`.

Our templates are pretty standard, but we should call attention to one item: dates. Recall earlier that we installed a package `mrt:moment` that gave us access to the [moment.js](http://momentjs.com/) library. Both in our "open" invitations list and our "closed" invitations list, we display a date for each invite. A date for when the invite was requested and a date for when the invite was approved/sent, respectively.

To make use of the moment package, we've created a template helper `{{epochToString <variable here>}}` that we can pass an epoch/unix timestamp string to and have it spit out a human-redable string (e.g. instead of `1415983049` you get `Friday, November 14th, 2014`). Let's look at the code powering our helper quick:

<p class="block-header">/client/helpers/helpers-ui.coffee</p>
```.lang-coffeescript
UI.registerHelper('epochToString', (timestamp) ->
  moment.unix(timestamp / 1000).format("MMMM Do, YYYY")
)
```

Here we're making use of spacebar's `UI.registerHelper` method to take the passed timestamp and convert it using moment. Notice that we're dividing our value by `1000` when we pass it to moment's `unix()` method. We do this because the number in our database is in _milliseconds_ whereas moment expects our time in _seconds_. Finally, we use moment's `format()` method to set a pattern for how we want our date to display. In this case we want the full month, day with prefix, and full year (e.g. `November 14th, 2014`).

Because we've defined this a UI helper, we can now reuse our `{{epochToString <variable here>}}` template tag whenever we want to convert our unix string to readable text.

Now, let’s look at the controller for our first tab where we load our list of “open” invitations, or, invitations that have been requested but not sent/approved.

<p class="block-header">/client/controllers/authenticated/open-invitations.coffee</p>
```.lang-coffeescript
Template.openInvitations.helpers(
  hasInvites: ->
    getInvites = Invites.find({invited: false}, {fields: "_id": 1, "invited": 1}).count()
    if getInvites > 0 then true else false

  invites: ->
    Invites.find({invited: false}, {sort: {"requested": 1}}, {fields: {"_id": 1, "inviteNumber": 1, "requested": 1, "email": 1, "invited": 1}})
)
```

In the first part of our controller for our `openInvitations` template, we create two helpers to check for the existence of our data and then load it into the template. This is pretty bog standard, however, we should call attention to the parameter being passed to our `find()` method's in both helpers: `{invited: false}`.

Look familiar? This is where we make use of the `invited` key that we set earlier. This allows us to pull only the invites that _haven’t_ been sent yet. Nice! **Note**: we’re again making heavy use of the `fields` option on our `find()` so that we only pull in the data that we need.

Cool, now, let’s see how we handle processing an invite. In our template, when we loop through our invites we add an “invite” button to each invite. In our controller, we wait for a click event on this to handle calling the method that will create a beta token for our user and send an invite email to them. Let’s take a look:

<p class="block-header">/client/controllers/authenticated/open-invitations.coffee</p>
```.lang-coffeescript
Template.openInvitations.events(
  'click .send-invite': ->
    invitee =
      id: this._id
      email: this.email

    url = window.location.origin + "/signup"

    confirmInvite = confirm "Are you sure you want to invite #{this.email}?"

    if confirmInvite
      Meteor.call 'sendInvite', invitee, url, (error)->
        if error
          console.log error
        else
          alert "Invite sent to #{invitee.email}!"
)
```
Ok, so here we’re doing a couple of things a few things. First, we build out an object to send to the server with the `_id` and `email` of the user we’re inviting. What’s unique about this is we’re not calling to an input field, but rather, making use of `@` or in good ol’ JavaScript `this.`.

`this` in this context (hang in there) means accessing the data context for the current item. Because we’re using an `{{#each}}` loop in our template, this translates to being the _currently looped item_. Said another way, looking at a list of our invites, `this` is like pointing to the second item and saying give me the data for this item. Confusing at first, but really cool and fun to use once you get the hang of it.

Next, we set a variable `url` equal to the value of `window.location.origin + "/signup”`. What does this mean? `window.location.origin` gives us the base url of where this script is running from.

We’re doing this here because we’ll be sending this URL to the server to be sent as part of our email. We want our user’s to be able to click a button in their email that links directly to the signup form.

Doing this ensures we’re grabbing the url from where the request is originating (e.g. if I run this on my local computer it would be `http://localhost:3000` whereas on the demo it’s `http://tmc-002-demo.meteor.com`). Neat! This is handy because it allows us to skip hardcoding URLs into our application that we could forget to change before going into production.

Lastly, after we double check our action with a `confirm()` dialog, we make a call to our `sendInvite` method on the server, passing our `invitee` and `url` variables independently. Rad. Now, let’s move over to the server and take a look a how we fire off an email to our user.

#### Sending Invites on the Server

Strap in, this is the best part (in my eyes, at least) of the recipe. Because our invite technically already exists in the database, we’re going to make use of the `update()` method on our `Invites` collection. Let’s take a look:

<p class="block-header">/server/data/update/invites.coffee</p>
```.lang-coffeescript
Meteor.methods(
  sendInvite: (invitee,url) ->
    check(invitee,{id: String, email: String})
    check(url,String)

    token = Random.hexString(10)

    Invites.update(invitee.id,
      $set:
        token: token
        dateInvited: ( new Date() ).getTime()
        invited: true
        accountCreated: false
    ,(error)->
      if error
        console.log error
      else
        # We’ll send notification to the user here.
    )
)
```

Cool, so we’ve got out method setup and notice we’re pulling in our `invitee` and `url` variables from the client as arguments in our `sendInvite` method. Next we do the right thing and `check()` our arguments against the expected pattern. We’re using two separate `check()`’s here because we’ve passed two separate items.

Next, we create a `token` variable and set it equal to the value of the method `Random.hexString(10)`. What the heck does this do? Well, recall back at the beginning of the recipe when we ran `meteor add random`?

This is where it comes into play. This function is helping us to create a completely random, 10 character hexadecimal string (letters and numbers) out of thin air. Really badass. In turn, we use this generated string as our “beta token” to uniquely identify beta testers that we’ve invited to try out the app.

With this, we can now update our user with the appropriate information. Again, we’re running an `update()` method on our existing invitation, setting the `token` equal to the random value we just created, setting the `dateInvited` to the current time so we now when we asked the user to join, flagging their invite as `invited` (again, to filter out our lists), and finally setting `accountCreated` to `false`.

Why `false`? This is an added bonus for administrators so we can quickly identify which beta testers have actually opened their invite and created an account. Totally optional but very helpful if you intend to track metrics or other startupy stuff in your application.

Now, the final part of this is that once we’ve successfully updated the user’s invite, we need to send them a notification via email.

<p class=“block-header”></p>
```.lang-coffeescript
SSR.compileTemplate('sendInvite', Assets.getText('email/send-invite.html'))

emailTemplate = SSR.render('sendInvite',
  token: token
  url: url
  urlWithToken: url + "/#{token}"
)

Email.send(
  to: invitee.email
  from: "Urkelforce Beta Invitation <dididothat@urkelforce.com>"
  subject: "Welcome to the Urkelforce Beta!"
  html: emailTemplate
)
```

Woah smokies, what the heck is all of this?! Earlier, we added a package to our application called `meteorhacks:ssr`. The `ssr` part of that stands for Server Side Rendering. In the code above the two functions calling on `SSR` are allowing us to pass data to and compile an HTML template on the server.

This is a big deal because it means that we’re able to inject data into a template without being on the client. This is super handy, especially if, say, you want to send HTML email. Let’s break down each function and see what’s going on.

```.lang-coffeescript
SSR.compileTemplate('sendInvite', Assets.getText('email/send-invite.html'))
```

This call to `.compileTemplate()` may look familiar if you read [Recipe #1](http://themeteorchef.com/recipes/exporting-data-from-your-meteor-application/) here on the site. This function is compiling a template for us called `sendInvite`, using the result of an `Assets.getText()` lookup on our `/private` directory for a file called `send-invite.html` nested in the `/email` folder.

Recall that `Assets.getText()` looks at the path you pass it _relative to_ the `/private` folder in your project. So here, we’re pulling an HTML email template from `/private/email/send-invite.html`.

It’s up to you to [dig into the email template](https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application/blob/master/code/private/email/send-invite.html), but know that in our next function, we’ll be assigning data to three variables we’ve included (`{{urlWithToken}}`, `{{url}}` and `{{token}}`) inside the file.

Next, we set a variable called `emailTemplate` to the result of calling `SSR.render()`:

```.lang-coffeescript
emailTemplate = SSR.render('sendInvite',
  token: token
  url: url
  urlWithToken: url + "/#{token}"
)
```

Notice here we’re making reference to the `sendInvite` name that we set in our `SSR.compileTemplate` method. We’re also setting our variables equal to the data that we sent over from the client. We’re accounting for two scenarios here.

The primary option (using `urlWithToken`) is making it possible for beta testers to click a button in the email we send them and automatically redirect them to the application, pasting their beta token into the field on our signup page (woah!). The second is to allow users to do this manually, instead pasting in their beta code on their own (not as cool, but hey, we’ve got to account for the curmudgeon factor).

Up next is actually firing off our email. The `Email.send()` method is made available by the `email` package we installed earlier using `meteor add email`. Here, we set some more obvious items like our to, from, and subject lines, and finally, pass our compiled and rendered email template to the `html` property.

<div class="note">
<h3>A quick note</h3>
<p>Notice that when we call Email.send(), we’re using the html option. Instead of html you can also pass a text option wherein you can send a single text string. This is great for quick emails like password resets or things that lack the need for fancy HTML woo.</p>
</div>

Alright, our email is ready to go out! Or is it? We need to talk about one thing: how to handle sending email from our application. If you were to run this method right now, an email wouldn’t actually send. Instead, you would see the contents of the email logged in your terminal. Why?

In order to send email, Meteor needs access to some service to actually _send_ the email on your application’s behalf. The Meteor Development Group recommend a service like [Mailgun](http://mailgun.com) for handling this.

This is what we’re using in our demo, so it’s recommended here too. In order to wire this up, you’ll need to create an account over at Mailgun. Next, you will need to set the `MAIL_URL` environment variable equal to Mailgun’s `smtp://` address with your authentication info included. In the demo I’ve set this up in `/server/admin/startup.coffee`. It looks something like this:

```.lang-coffeescript
process.env.MAIL_URL = 'smtp://postmaster%40YOURDOMAIN.mailgun.org:YOURPASSWORD@smtp.mailgun.org:587'
```
The long address after the `smtp://` part is your unique URL provided by Mailgun which acts as your “username.” Once you’ve got that in place, Meteor will know that you want to send email via your Mailgun account. Awesome!

With our email out the door and in our user’s mailbox, our last step is to get the user back to our application and signed up!

### Getting Users Signed Up

For this last part, we’re going to focus on getting our users back to our application. More specifically, we’re expecting our user to come back to our application through our signup page, bringing their beta token with them. The link in their email will look something like this:

```.lang-markup
http://website.com/signup/xj31mat531
```
That last part is their token. Because we want our users to have a great experience using our application, we’re going to automate this process a bit. Recall earlier when we set up our routes? When we defined our `/signup/:token` route, we also defined a `Session` variable in our `onBeforeAction` callback function called `betaToken`, equal to the token in our URL.

Now, we want to retrieve that token and set it as the value of our Beta Token field on our signup form as soon as the user visits the page (in the biz we call this [“magic”](http://media.giphy.com/media/ujUdrdpX7Ok5W/giphy.gif)). In our template, here is how our Beta Token field looks:

```.lang-markup
<input type="text" name="betaToken" class="form-control" placeholder="Beta Token" value="{{betaToken}}">
```

Notice that our value parameter is set to a template variable `{{betaToken}}`. Hop over to our controller for the `signup` template in `/client/controllers/public/signup.coffee`. There, we’ll add a template helper that will supply the value for this variable by calling to the `betaToken` `Session` variable we set in our router.

<p class="block-header">/client/controllers/public/signup.coffee</p>
```.lang-coffeescript
Template.signup.helpers(
  betaToken: ->
    Session.get 'betaToken'
)
```

Short, simple, sweet. Now when our user hits the `/signup` page with their token, it will automatically show up in the field. Copy and paste is for _chumps_. Alright, back to adult time.

Now, we need to actually handle the process of creating an account for our user. The trick, here, is that we want to make sure that the user signing up (their email address) exists in our invites list _and_ that they have a valid invite token (again, we’ve written our code so that this only exists _after_ an administrator has decided to invite a user).

In order to facilitate the form submission, we’re making use of the same validation pattern we covered earlier. To save time, we’re going to focus on the code being called in the `submitHandler` function, again, what happens after the form is deemed “valid.”

<p class="block-header">/client/controllers/public/signup.coffee</p>
```.lang-coffeescript
user =
  email: $('[name="emailAddress"]').val().toLowerCase()
  password: $('[name="password"]').val()
  betaToken: $('[name="betaToken"]').val()

Meteor.call 'validateBetaToken', user, (error)->
  if error
    alert error.reason
  else
    # What we’ll do when the method succeeds.
```
Super straightforward. First we create a `user` variable containing an object with all of the values entered into our form, passing those to a method call for `validateBetaToken` on our server. Easy peasy. You’ll notice a hint that we’ll need to do one more thing on the client before call this thing complete. Before we do, let’s jump over to the server and look at how we’re handling our token validation.

#### Token Validation on the Server

Over on the server, we need to make sure that our user’s email address and beta token exist before we officially provision their account. Here’s how the method is shaping up:

<p class="block-header">/server/data/read/beta-tokens.coffee</p>
```.lang-coffeescript
Meteor.methods(
  validateBetaToken: (user)->
    check(user,{email: String, password: String, betaToken: String})

    testInvite = Invites.findOne({email: user.email, token: user.betaToken}, {fields: {"_id": 1, "email": 1, "token": 1}})

    if not testInvite
      throw new Meteor.Error "bad-match", "Hmm, this token doesn't match your email. Try again?"
    else
      id = Accounts.createUser(
        email: user.email
        password: user.password
      )

      Roles.addUsersToRoles(id, ['tester'])

      Invites.update(testInvite._id,
        $set:
          accountCreated: true
        $unset:
          token: ""
      )
)
```

The bulk of this should look familiar, so we won’t beat around the bush. Of course, first, we `check()` our arguments like good boys and girls and then in our `findOne()` we pass the `email` and `token` the user is trying to sign up with.

Next, we test in the negative against the result of our `findOne()` which is set to the variable `testInvite`. If our result is false, or, an invite cannot be found with the passed `email` and `token`, we throw an error that will be returned to the client.

Conversely, if all goes well, we do three things. First, we go ahead and create an account for our user. Here, we’re making use of the `email` and `password` values the user entered on the client. Next, we’re making sure that our new user is identified as a “tester.”

To do this, we’re reintroducing the `alanning:roles` package we saw when we were setting up routing. This time we make use of the `Roles.addUsersToRoles()` method to set the `roles` value on our user’s new account equal to `[‘tester’]`.

Now, when our user logs in, our route filters will be able to tell that they’re a tester (as opposed to an admin) and direct them to the correct part of the application. _Hot diggity dog_.

Lastly, we tie everything up in a bow by updating our invite to show that our user’s account has been created. We also remove their token, rendering it non-existent and useless (e.g. if their friend got smart and tried to use the token in their email their signup attempt would be denied).

Okay. Phew. We are really close. There’s just _one more thing_.

#### Back To the Client

Alright. Last step. Seriously. Recall that before we hopped on the server, we did a little foreshadowing that we’d need to do something else on the client before we called it a day. If you’re keen you probably realized that because we created our user’s account on the server, we lose the nice UX touch of automatically logging in our user.

Unfortunately, in order to make use of the `alanning:roles`	 package, we needed to run our `Accounts.createuser()` function on the server. But no worries! We can easily implement an auto-login ourselves. Let’s take a look:

<p class="block-header">/client/controllers/public/signup.coffee</p>
```.lang-coffeescript
Meteor.loginWithPassword(user.email, user.password, (error)->
  if error
    alert error.reason
  else
    Router.go '/dashboard'
)
```

In the `else` statement of our `Meteor.call ‘validateBetaToken’` method’s callback, we can run `Meteor.loginWithPassword()`, passing the email and password the user entered into the form earlier.

Wait, how does that work? Well, because we’re creating the user’s account on the server _before_ we make a call to `loginWithPassword()`, we know that the user’s account already exists with an email and password identical to what they typed in. It sounds a bit loopy, but makes perfect sense if you think about it.

Ok! With our user being logged in, assuming we don’t run into any errors, we cap off our code with a call to `Router.go ‘/dashboard’` which tells Iron Router to redirect to the `/dashboard` route.

Drumroll please…

Annnnnd Carl Winslow dancing. You're welcome.

![http://media.giphy.com/media/l1UWxyIhsZi8g/giphy.gif](http://media.giphy.com/media/l1UWxyIhsZi8g/giphy.gif)

Just _look at him go_. Moves.

### Wrap Up & Summary

Cool, right? In this recipe, we learned how to collect emails from users on our index page and make it possible to send invites to them using unique Beta Tokens. We looked at using the Random package, rendering a server side email template, and even learned about UI helpers. Alright, now it's off to the races. [Y Combinator](https://www.ycombinator.com/) here we come!
