<div class="note info">
  <h3>Pre-Written Code <i class="fa fa-info"></i></h3>
  <p><strong>Heads up</strong>: this recipe relies on some code that has been pre-written for you (like routes and components), <a href="https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application">available in the recipe's repository on GitHub</a>. During this recipe, our focus will only be on implementing an invitations feature. If you find yourself asking "we didn't cover that, did we?", make sure to check the source on GitHub.</p>
</div>

<div class="note">
  <h3>Additional Packages <i class="fa fa-warning"></i></h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://themeteorchef.com/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed below are merely recipe-specific additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://themeteorchef.com/base/packages-included">Packages Included list</a> for Base to ensure you have fulfilled all of the dependencies.</p>
</div>

### Prep
- **Time**: ~2-3 hours
- **Difficulty**: Intermediate
- **Additional knowledge required**: writing routes with [Flow Router](https://themeteorchef.com/snippets/client-side-routing-with-flow-router/), working with [React](https://themeteorchef.com/recipes/getting-started-with-react), using [Meteor methods](https://docs.meteor.com/#/full/meteor_methods), and [sending email](https://themeteorchef.com/snippets/using-the-email-package).

### What are we building?
One of our clients, a new startup called "Urkelforce," is readying the release of their beta application. Because they're so focused on the product, they've asked us if we could help them out with a few tasks. In particular, they're looking to implement a beta invitation system that will allow people who are interested in Urkelforce to sign up and try it out. They've asked that the invitation system works so that they can send out invites manually as their capacity for more users grows.

<figure>
  <img src="https://tmc-post-content.s3.amazonaws.com/urkelforce-demo.gif" alt="The sign up page we'll be building.">
  <figcaption>The sign up page we'll be building.</figcaption>
</figure>

As part of their request, they've asked that we build the invitation system using React (their main product uses React and they'd like to be able to maintain this after the fact). In this recipe, we're going to help them out and build a complete invitation system. We'll create a sign up page for new users, a flow for sending out invitations, and a way for users who have been invited to accept their invitation.

### Ingredients
Before we start building, make sure that you've installed the following packages in your application. We'll use these at different points in the recipe, so it's best to install these now so we have access to them later.

#### Meteor packages

<p class="block-header">Terminal</p>

```.lang-bash
meteor add react
```
We'll use the `react` package—created by the Meteor Development Group—to give us access to the [React](http://facebook.github.io/react/) user interface library. This well help us to build our interface with reusable components.

<p class="block-header">Terminal</p>

```.lang-bash
meteor add kadira:react-layout
```
We'll use the `kadira:react-layout` package to help us render some of our React components from within our routes.

<p class="block-header">Terminal</p>

```.lang-bash
meteor add alanning:roles
```

The `alanning:roles` gives us the ability to specify different "types" of users in our application. In this recipe, we'll use Roles to create two types of users: "testers" and "admins."

<p class="block-header">Terminal</p>

```.lang-bash
meteor add random
```

The `random` package is an official package offered by the Meteor Development Group to assist in the generation of random numbers and hexidecimal values. We'll rely on this package to help us generate beta tokens for Urkelforce's beta testers.

<p class="block-header">Terminal</p>

```.lang-bash
meteor add email
```

The `email` package is another package offered by the Meteor Development Group that gives us the ability to send email from our application. We'll use this to handle the delivery of our beta invitation email.

<p class="block-header">Terminal</p>

```.lang-bash
meteor add mrt:moment
```

Last but not least, the `mrt:moment` package gives us access to the [moment.js library](http://momentjs.com/) for creating human-readable date and time strings. We'll use this for a UX touch in our invite admin panel for displaying when an invite was requested.

### Defining our routes

To get our beta invitation system up and running, we'll need to define a few routes in our application. Before we jump in, here's what we need:

- A route where users from the public can sign up to get an invite.
- A route where users from the public can create their account once they've received a beta token.
- A route where administrators can see a list of requested invites and manually invite new users.
- A route where administrators can see a list of invites that have been sent along with their redemption status.
- An example area where we can send our beta testers _after_ they've created an account.

You'll notice that we have two distinct areas in our application: a public side that _anyone_ can see and an administrative side that only administrators can see. To handle the flow of traffic, we'll make use of [component-based authentication](https://themeteorchef.com/snippets/authentication-with-react-and-flow-router) which will allow us to selectively render components based on things like a user's role. To get started, let's take a quick look at how our routes are set up and discuss their overall behavior.

#### Public Routes

First, let's define our public routes. These are the public-facing routes that _anyone_ can visit:

<p class="block-header">/both/routes/public.jsx</p>

```javascript
const publicRoutes = FlowRouter.group({
  name: 'public'
});

publicRoutes.route( '/', {
  name: 'index',
  action() {
    ReactLayout.render( App, { yield: <Index /> } );
  }
});

publicRoutes.route( '/signup', {
  name: 'signup',
  action() {
    ReactLayout.render( App, { yield: <Signup /> } );
  }
});

publicRoutes.route( '/signup/:token', {
  name: 'signup',
  action( params ) {
    ReactLayout.render( App, { yield: <Signup token={ params.token } /> } );
  }
});

publicRoutes.route( '/login', {
  name: 'login',
  action() {
    ReactLayout.render( App, { yield: <Login /> } );
  }
});
```

Here, we define a route group called `publicRoutes` and assign each of our routes. For each route, we do three big things: first, we provide a path that the user can visit, a name for the route (so we can reference it later), and we make a call `ReactLayout.render()` which helps us to specify which component we should render on the page.

That last part, rendering a component, is the most important. Notice that for each route, we're passing two arguments to `ReactLayout.render()`: `App`, the name of a _layout_ component that we'll define in a little bit and an object with a property `yield`. Within the `App` component that we'll create—our layout—we'll provide an area called `yield` which is where the React component we're passing will ultimately be rendered. 

All of the components we're passing here are pretty basic. Because our routes file is being defined using JSX—React's spiffy new syntax for meshing our markup with our JavaScript—we can specify the React component we want to render directly in this file like `<Index />`. Neat, eh? This admittedly takes a bit of getting used to, but it does help to keep things consistent and clear.

One thing we should point out now before moving ahead is the route being defined at `/signup/:token`. Because our goal is to eventually send new users an invitation email, we'll need a route where we can send them to actually _claim_ their invitation. Here, we're creating a route that accepts a `:token` parameter, meaning, any value passed in that portion of the url is made accessible to our `action()` method's `params` argument on our route. Inside of our route definition, we make use of this by passing the current value of `:token` as a _prop_—React-slang for "property"—to our `<Signup />` component.

Don't let this startle you now. Just remember that we're passing this through now so we can make use of it later. Next up, let's take a quick look at the routes we'll have access to when a user is authenticated. These are a bit simpler, so we'll just take a quick peek.

#### Authenticated Routes
Just two authenticated routes will get the job done for us:

<p class="block-header">/both/routes/authenticated.jsx</p>

```javascript
const authenticatedRoutes = FlowRouter.group({
  name: 'authenticated'
});

authenticatedRoutes.route( '/dashboard', {
  name: 'dashboard',
  action() {
    ReactLayout.render( App, { yield: <Dashboard /> } );
  }
});

authenticatedRoutes.route( '/invites', {
  name: 'invites',
  action() {
    ReactLayout.render( App, { yield: <InvitesList /> } );
  }
});
```
Nearly identical to our public routes. Here, we define two routes: `/dashboard` and `/invites`. The first is where we'll send our users once they've accepted their invitation and have been logged in. The second, `/invites`, will be used to show administrators a list of the invite requests for the app as well as those that have already been sent out (along with their acceptance status).

Cool! So at this point we have all of our routes set up along with the components they'll need to render. Next up, let's set up that `App` component as it will be responsible for rendering each of our components throughout the recipe, as well as handling our authentication.

### Defining an `App` layout
In the last step, we defined each of the routes in our application. As part of those routes, we included a call to `ReactLayout.render()` which is responsible for rendering the specified component(s) for that route. As part of that call, we also specified a layout `App` that we want to use to determine the positioning of our rendered component. Huh? That deserves a bit of clarity.

A layout component is best thought of as a wrapper. Its responsibility is to "wrap" the content of our application, or, the current component. Generally speaking, layout components are handy because they allow us to define globally visible elements on the page like our application's header and wrap a container element around our content. In the context of this recipe, we'll use a layout component called `App` which will allow us to add some global elements, but also control how our users can navigate around the app.

<p class="block-header">/client/components/layouts/app.jsx</p>

```javascript
App = React.createClass({
  [...]
  render() {
    return <div className="app-root">
      <AppHeader hasUser={ this.data.hasUser } />
      <div className="container">
        { this.data.loggingIn ? this.loading() : this.getView() }
      </div>
    </div>;
  }
});
```

Let's start at the bottom. Here, we can see our `App` component being defined along with a `render` method for outputting the contents of our component. Inside, we can see the inclusion of a component `<AppHeader />` (taking on a property `hasUser`) and then a container element being wrapped around a bit of logic. What's happening here? 

First, notice that we're making two calls to `this.data` here. As we'll see soon, `this.data` is used to reference the value(s) returned by the `getMeteorData` method on our component. This method is given to us via a mixin called `ReactMeteorData`. Using `getMeteorData`, we can gain the reactive functionality familiar to us and share reactive data with the rest of our component via `this.data`. 

For our header, we want to pipe in whether or not there's a current user. Why? Well, if there is, we'll want our header to render one set of menu items for authenticated users, and if not, our "public" menu items. Passing this as a property here, we can handle all of the authentication in our `App` component, but still take advantage of it in the header. Neat!

<div class="note">
  <h3>Skipping The Navigation <i class="fa fa-warning"></i></h3>
  <p>To save a bit of time, we'll be skipping an in-depth look at how our navigation component is working. Never fear, the full source is <a href="https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application/tree/master/code/client/components/globals/header.jsx">available here on GitHub</a>. If you get stuck or something isn't clear, don't hesitate to ask a question in the comments!</p>
</div>

The important part here is what's happening in the `.container` element. Here, we're trying to determine whether or not a user is being logged in. If they _are_, we make a call to `this.loading()`, a method we'll define next that displays our loading template. If _not_, we make a call to `this.getView()`, a method on our component that will determine which—if any—component we should be rendering here.

<p class="block-header">/client/components/layouts/app.jsx</p>

```javascript
App = React.createClass({
  [...]
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
```

Adding in these methods, we can see that the `loading()` method referenced as `this.loading()` in our `render` method simply returns an empty `<div></div>` element. This is by choice—it just renders a plain page while loading—and can be handled however you'd like; for example, you could display a spinner here. Up to you! The more important addition here is the `getView()` method. This is where our user's fate is decided. Inside, we make a call to `this.data.canView()` which we'll define next. This will determine whether or not the user is allowed to view the route they've requested. If they _are_, we simply return `this.props.yield` which corresponds to the component we passed to the `yield` property in our calls to `ReactLayout.render()`.

If the user is _not_ allowed to view the requested route, we make another check to see if there is a current user. If there is, we simply render the `<Dashboard />` component for them—this is the default for non-admin, logged-in users—and if there isn't, we display the `<Login />` component. Simple as that! To make sense of all this, let's take a look at the pieces behind `this.data`.

<p class="block-header">/client/components/layouts/app.jsx</p>

```javascript
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
```

Don't give up! This is actually pretty easy. Remember, in order to get access to the reactive `getMeteorData` method, we need to add the `ReactMeteorData` mixin which we're doing up top. Next, we define our `getMeteorData` method and return a big ol' object from it. What the heck is happening here? This is like the security checkpoint at the airport. Here, we have all of the radar detectors and other rights-violating—not really, but what a visual, eh?—equipment we need to determine whether or not our users can see what they're requesting.

The import one, `canView()` does the bulk of the work. Here, we grab the current route's name and perform a few checks. First, we test whether or not the current route is a public route, then we test whether it's an admin route, and the finally, we check whether the current user is an administrator. Using these checks, then, we respond to the question "can our user view this?" 

If the route is for admins only and the user is _not_ and admin, we respond in the negative with `false`, meaning, "nope, get them outta here!" If the route is _not_ an admin route—and our user is not an admin—we attempt to return whether the route is public (if it is, anybody can see it) or, if there's a logged in user (meaning the route is for logged in, non-admin users). Woof!

Take your time with this part as it's crucial to controlling how users move through our application. The important thing to remember: `getMeteorData` is reactive, meaning, `this.data` will update in response to changes to any reactive data source (e.g. `Meteor.user()`). For example, if a user is logged in and then logs out, the value `this.data.currentUser` will become `null` because there is no longer a user. We can use this reactivity to our advantage within our component to control what a user sees based on their behavior.

Though it may not seem like much, this gives us a solid foundation for handling our authentication flow! Next up, we need to start fleshing out the components we were rendering on each route. First up, we're going to look at the sign up page where users can request invitations.

### Adding a collection for invites

With our routes in place we can start getting some data into the database and work toward issuing invites to users interested in joining the Urkelforce beta. Let's start by defining a collection to store our invites in.

<p class="block-header">/collections/invites.js</p>

```javascript
Invites = new Meteor.Collection( 'invites' );

Invites.allow({
  insert: () => false,
  update: () => false,
  remove: () => false
});

Invites.deny({
  insert: () => true,
  update: () => true,
  remove: () => true
});

let InvitesSchema = new SimpleSchema({
  "email": {
    type: String,
    label: "Email address of the person requesting the invite."
  },
  "invited": {
    type: Boolean,
    label: "Has this person been invited yet?"
  },
  "requested": {
    type: String,
    label: "The date this invite was requested."
  },
  "token": {
    type: String,
    label: "The token for this invitation.",
    optional: true
  },
  "accountCreated": {
    type: Boolean,
    label: "Has this invitation been accepted by a user?",
    optional: true
  },
  "dateInvited": {
    type: String,
    label: "The date this user was invited",
    optional: true
  },
  "inviteNumber": {
    type: Number,
    label: "This invitation's position in the queue."
  }
});

Invites.attachSchema( InvitesSchema );
```

Pretty basic. Here, we define our collection as `Invites` and then lock down our allow/deny rules on the client for [some better security](https://themeteorchef.com/blog/securing-meteor-applications). Once we have that in place, we [define a schema](https://themeteorchef.com/snippets/using-the-collection2-package) for our collection to control what properties we expect—along with their types—each object we insert into the collection to have. That's it! This is all pretty simple, but helpful for keeping our data consistent in the database. With this in place, we can start to wire up our `<Index />` component for accepting invitations.

### Adding the index page
Brace yourself. To get our `<Index />` component set up, we're going to be relying pretty heavily on React's ability to nest components. If you're just getting started with React, this will look scary. While we won't cover _every_ detail, we'll try to explain the high-level concepts so it's—roughly—clear what's happening and why.

<p class="block-header">/client/components/public/index.js</p>

```javascript
Index = React.createClass({
  [...]
  render() {
    return <div classNameName="index">
      <PageHeader label="Request an Invite to Urkelforce" />
      <Image
        className="urkel-gif"
        src="http://media.giphy.com/media/TaFTuXWTJf2iA/giphy.gif"
        alt="Steve Urkel making faces."
      />
      <p>Urkelforce is a super secret app that's launching soon! Type in your email below to get on the beta list.</p>
      <Form ref="requestForm" id="request-beta-invite" className="email-form" onSubmit={ this.handleSubmit }>
        <Input
          ref="emailAddress"
          type="email"
          name="emailAddress"
          className="form-control"
          placeholder="e.g. beatrix@beta.com"
        />
        <Button type="submit" buttonStyle="success" label="Request Beta Invite" />
      </Form>
    </div>;
  }
});
```
Ahhh f*?!*>g React. No! This may look pretty alien, but rest assured this all has a purpose. First, let's talk about what's happening in a general sense here. With React, the idea is to compose our interface out of reusable components. When we say component, we mean everything from a single element on a page like a button, up to an entire view. The trick with React is learning to identify when and where to break a piece of your interface off into a new component.

Here, we're [going whole hog](https://youtu.be/-LCsiWL6gn0?t=2m18s) with components. Notice that our entire `<Index />` component is made up of _other_ components. The idea, here, is that we don't want to repeat the same markup over, and over, and over, like we might with a template. Instead, we define a component that specifies our markup _once_ and then create instances of that component, "injecting" properties into it.

The simplest example here is our `<PageHeader />` component, so let's take a peek at the source for that real quick.

<p class="block-header">/client/components/ui/page-header.jsx</p>

```javascript
PageHeader = React.createClass({
  render() {
    return <h4 className="page-header">{ this.props.label }</h4>;
  }
});
```

See what's happening here? Up in our `<Index />` component, we're calling our `<PageHeader />` component with a property `label` and passing it a string. When React goes to render that component, it's looking at the above code. Notice that we're asking for the `label` prop with `this.props.label` inside of our render method. This is doing exactly what you'd expect: rendering the string we passed inside the component. Using our example, a rendered version of this would look something like `<h4 className="page-header">Request an Invite to Urkelforce</h4>`. Making sense? We repeat this same pattern again and again, always trying to narrow down our interface into reusable components.

> [H]ow do you know what should be its own component? Just use the same techniques for deciding if you should create a new function or object. One such technique is the single responsibility principle, that is, a component should ideally only do one thing. If it ends up growing, it should be decomposed into smaller subcomponents.
>
> &mdash; [Thinking in React](http://facebook.github.io/react/docs/thinking-in-react.html) via React

Pretty simple, but mildly confusing at first. Why would we want to do this beyond reusability? Clarity. Although our recipe is pretty simple _now_, remember that the team at Urkelforce wants to be able to maintain this later. By implementing our interface using a series of components, we're making it easier for them to come back and reason through our work later. This is where React shines. It makes it very easy to understand what a component is responsible for. This isn't _law_, per se, but a strict recommendation. You could theoretically drop an entire HTML page into your render method and it will work. The point, though, is to avoid having to do that.

Applying this concept to the rest of our components here, we can see that all we're really doing is passing props over to the components we've defined and letting React take care of the rendering. While we _could_ step through every single component being defined here, it would get pretty nauseating quick. Instead, it's recommended that you play with [the components in the source for this recipe](https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application/tree/master/code/client/components). Tweak them. Pass funky properties to them. Break stuff! 

React is a complete paradigm shift and requires a fair amount of tinkering to understand (speaking from experience as I just didn't "get it" the first few times). Once you get it, though, you'll be glad you took the time to appreciate the approach it suggests. Consider this app your sandbox! Okay, enough rambling....

So. The part that we care about here is the `<Form />` component. This is where we're grabbing the user's email address and then using it to create their invitation. Two parts to pay attention to here: the `ref` property on the component `"requestForm"` and the `onSubmit` property. Together, we can use these to both reference our form and grab values from it to send up to the server. Let's update our `<Index />` component a bit to include a couple more methods.

<p class="block-header">/client/components/public/index.jsx</p>

```javascript
Index = React.createClass({
  componentDidMount() {
    let refs = this.refs,
        form = React.findDOMNode( refs.requestForm );

    $( form ).validate({
      rules: {
        emailAddress: { required: true, email: true }
      },
      submitHandler() {
        let email = React.findDOMNode( refs.emailAddress );

        Meteor.call( 'addToInvitesList', email.value, ( error ) => {
          if ( error ) {
            alert( error.reason );
          } else {
            email.value = "";
            alert( 'Invite requested. We\'ll be in touch soon. Thanks for your interest in Urkelforce!' );
          }
        });
      }
    });
  },
  handleSubmit( event ) {
    event.preventDefault();
  },
  render() {
    return <div classNameName="index">
      [...]
      <Form ref="requestForm" id="request-beta-invite" className="email-form" onSubmit={ this.handleSubmit }>
        <Input
          ref="emailAddress"
          type="email"
          name="emailAddress"
          className="form-control"
          placeholder="e.g. beatrix@beta.com"
        />
      <Button type="submit" buttonStyle="success" label="Request Beta Invite" />
      </Form>
    </div>;
  }
});
```

This is where React starts to get a little stickier. Here, we've added two methods: `componentDidMount` and `handleSubmit`. The first is known as a "lifecycle method" and is built-in to React. This method gets fired immediately after the component's render method has completed (meaning the component has been rendered on screen). This is analagous to Meteor's `onRendered` method in Blaze. 

Inside, we're taking advantage of a new concept introduced by React: refs. Refs—React-slang for "refrences"—point to different elements in the current component. Remember just a little bit ago, we added a `ref` property to our `<Form />` component, as well as the `<Input />` element it contains. In the context of our `<Index />` component, we can access these with `this.refs.requestForm` and `this.refs.emailAddress`.

The tricky part with this is figuring out why we're doing it. With React, the goal is to isolate DOM selection and manipulation to the component, and more specifically, to React itself. Usage of tools like jQuery for DOM selection, while perfectly functional, are frowned upon. As an alternative, we can use refs which point to the virtual DOM elements created for us by React.

To interact with those elements (e.g. getting a reference to their _actual_ markup), we can use refs. Inside of our `componentDidMount()` method we can see this taking place. First, we grab the DOM node corresponding to our rendered `<Form />` component using the `React.findDOMNode()` method, passing in the _ref_ to our requestForm. Huh? Look back at the `<Form />` component's `ref` property. See how it's set to `"requestForm"`? This is the connection.

Using this, we access the form element in the DOM. [Going against the grain](https://youtu.be/L397TWLwrUU?t=1m16s) ever so slightly, we make a call to the validate method given to us by the [jQuery validation](http://jqueryvalidation.org/) library included with [Base](https://themeteorchef.com/base/packages-included/). Why? To be blunt: validation in React is a bummer. There are not a lot of clear patterns for it yet and the one's that do exist are...well, written by total nerds. In translation, they're a bit more confusing than seems necessary. The solution here works just fine, but take it with a grain of salt.

Notice that all we're doing here is validating that our email input has a value (the jQuery validation library is silently doing this via the `name` attribute/prop on our `<Input />` component) and that it's a valid email address. After we've confirmed that, we handle our submit using the `submitHandler` method from the validation library and make a call to add our prospective user's email to our list.

Real quick, we should call out why we're _not_ doing this in the `handleSubmit()` method of our component. Unfortunately, without this, our validation won't technically work (meaning, it won't block the form submission). The validation will fire, but so too will the `handleSubmit` method. This is because we're binding our call to this on our `<Form />` component directly via the prop `onSubmit`. Even though we're attaching our form validation—which would prevent submission of a non-React element just fine—here, we're not so lucky. To get around this issue, we just rely on the `submitHandler` callback of our validation.

<div class="note">
  <h3>To validate, or not. That is the question. <i class="fa fa-warning"></i></h3>
  <p>This solution isn't entirely necessary. Some people prefer client-side validaiton, others may not. In the context of React, it's a bit of a toss up at this point. In theory, you could skip the client-side validation and leave it all up to the server (tossing errors back to the client accordingly). It all comes down to your user experience preferences/needs.</p>
</div>

Okay, so. Now we're ready to create our invite. Notice that before we send everything to the server, we again rely on the refs concept to pull the value of our `emailAddress` input. This is pretty similar to calling something like `template.find( '<element>' ).value` in Blaze. Instead of relying on the template instance, though, we're focusing on the component instance. It's funky at first, but you'll get used to it. Once we have the value, we toss it up to the server to create our invite. Finally! Let's take a look.

#### Creating invites on the server
Fortunately, the actual code to handle the creation of our invite is pretty simple. Let's take a peek at the method now and then explain it quick.

<p class="block-header">/server/methods/insert/invites.jsx</p>

```javascript
Meteor.methods({
  addToInvitesList( email ) {
    check( email, String );

    let emailExists = Invites.findOne( { email: email } ),
        inviteCount = Invites.find( {}, { fields: { _id: 1 } } ).count();

    if ( !emailExists ) {
      return Invites.insert({
        email: email,
        invited: false,
        requested: ( new Date() ).toISOString(),
        token: Random.hexString( 15 ),
        accountCreated: false,
        inviteNumber: inviteCount + 1
      });
    } else {
      throw new Meteor.Error( 'already-invited', 'Sorry, it looks like you\'ve already requested an invite! Hang tight :)' );
    }
  }
});
```

Ahh, a whiff of simplicity. We don't have too much going on here. First, we take in our email from the client and [use check](https://themeteorchef.com/snippets/using-the-check-package/) to make sure that it's a `String` type. Next, we do a quick spot of verification to make sure that our prospective user isn't double dipping with a `findOne`. If we _do_ find that user in the invites list already, we toss an error back to the client letting the user know to be patient. If they _don't_ exist, though, we go ahead and insert a new invite for them in the database. 

Two things to point out here. First, notice that to create the user's token, we're relying on the `random` package's `hexString()` method. Additionally, we set the user's `inviteNumber` (the total number of invites requested so far plus one). With this in place, our user has been invited! Back on the client, we let them know that they're all signed up in the callback of our `Meteor.call()` block. Boom!

Phew. This is a burner. Don't worry, it will all be worth it when we're done!

Next up, we need to create a way for us to review and send out invitations. Let's get started by creating a new component and wiring up our data from the database. Same rules apply, there are quite a few components being spun up, so we'll explain the crazier ones and skip the browsable items to save us some time.

### Displaying and sending invites
Okay! At this point, we've got our users requesting invites. What we want now, however—per our client's request—is to be able to see a list of invites and then selectively invite users one at a time. To get started, let's wire up a new component `<InvitesList />` to display everything.

<p class="block-header">/client/components/authenticated/invites.jsx</p>

```javascript
InvitesList = React.createClass({
  [...]
  render() {
    return <div className="invites">
      <PageHeader label="Invites" />
      <NavTabs context="invite-tabs" tabs={ this.tabs } />
      <TabContent context="invite-tabs" tabs={ this.tabs }>
        <TabPanel active={ true } id="open-invitations">
          <Table context="open-invitations" columns={ this.data.openInvitations.columns }>
            { this.data.openInvitations.data.map( ( invite ) => {
              return <OpenInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
        <TabPanel active={ false } id="closed-invitations">
          <Table context="closed-invitations" columns={ this.data.closedInvitations.columns }>
            { this.data.closedInvitations.data.map( ( invite ) => {
              return <ClosedInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
      </TabContent>
    </div>;
  }
});
```

Don't freak out! Remember, all that's happening here is we're splitting up our interface into as many reusable components as possible. Here, the core part of what we're doing is creating a tabbed interface that will allow us to display two lists: uninvited users and invited users. Like this:

<figure>
  <img src="https://tmc-post-content.s3.amazonaws.com/urkelforce-invites-list.gif" alt="Switching between open and closed invite tabs.">
  <figcaption>Switching between open and closed invite tabs.</figcaption>
</figure>

To do this, we want to create a few reusable components. Namely, we've set up three to handle our tabbing system: `<NavTabs />`, `<TabContent />`, and `<TabPanel />`. Real quick, let's spit out all three of these components and talk about the more confusing parts.

<p class="block-header">/client/components/ui/nav-tabs.jsx</p>

```javascript
NavTabs = React.createClass({
  render() {
    return <ul className="nav nav-tabs" role="tablist">
      { this.props.tabs.map( ( tab, index ) => {
        return <li key={ `${this.props.context}_${index}` } role="presentation" className={ tab.active ? 'active' : '' }>
          <a href={ tab.content } role="tab" data-toggle="tab">{ tab.label }</a>
        </li>;
      })}
    </ul>;
  }
});
```

<p class="block-header">/client/components/ui/tab-content.jsx</p>

```javascript
TabContent = React.createClass({
  render() {
    return <div className="tab-content">
      { this.props.children }
    </div>;
  }
});
```

<p class="block-header">/client/components/ui/tab-panel.jsx</p>

```javascript
TabPanel = React.createClass({
  render() {
    let classes = this.props.active ? 'tab-pane active' : 'tab-pane';

    return <div role="tabpanel" className={ classes } id={ this.props.id }>
      { this.props.children }
    </div>;
  }
});
```

First, notice that aside from our `<NavTabs />` component, our other components are using the `this.props.children` convention. If this is unfamiliar, what's happening here is that whenever we call our component as a "wrapper," we're grabbing everything that it's wrapping. To make that a little clearer:

```javascript
<TabPanel active={ true } id="open-invitations">
  <p>This is a child of TabPanel.</p>
  <h3>This is another child of TabPanel.</h3>
</TabPanel>
```

In this example, notice that everything wrapped by the `<TabPanel /></TabPanel>` component is considered a child _of_ that component. By calling `{this.props.children}` inside of the component's definition, we're saying "give us everything this instance of the component is wrapping." In this case, then, we'd be saying output the `<p></p>` tag and `<h3></h3>` tag this is wrapping. Making sense? Using this technique, we can create "wrapper" components whose sole purpose is to give some sort of styling or context to whatever it's containing.

Back up top, notice that to handle our tabs we're making use of a call to `map()` inside of our JSX. What we're doing here is outputting a new tab element for each one passed via `this.props.tabs`. If we look back at our `<ListItems />` component, we can see our `<NavTabs />` component taking on a `tabs` prop. For each item passed here, we simply spit out an `li` tag, making sure to set a key—this is [a React thing](https://facebook.github.io/react/docs/multiple-components.html#dynamic-children)—and then pipe in the values via props accordingly.

Cool! What's nice about this setup is that we don't have to add any events to toggle our tabs because we're getting this for free from Bootstrap. If we were building our own system, though, we'd want to map this functionality via the `onClick` method of each of our tabs. With these up and running, let's zip back up to our `<ListItems />` component and talk about how we're actually outputting items.

<p class="block-header">/client/components/authenticated/invites.jsx</p>

```javascript
InvitesList = React.createClass({
  [...]
  render() {
    return <div className="invites">
      <PageHeader label="Invites" />
      <NavTabs context="invite-tabs" tabs={ this.tabs } />
      <TabContent context="invite-tabs" tabs={ this.tabs }>
        <TabPanel active={ true } id="open-invitations">
          <Table context="open-invitations" columns={ this.data.openInvitations.columns }>
            { this.data.openInvitations.data.map( ( invite ) => {
              return <OpenInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
        <TabPanel active={ false } id="closed-invitations">
          <Table context="closed-invitations" columns={ this.data.closedInvitations.columns }>
            { this.data.closedInvitations.data.map( ( invite ) => {
              return <ClosedInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
      </TabContent>
    </div>;
  }
});
```

Notice that here, we're also using two `.map()` loops to output our data: one for `openInvitations` and one for `closedInvitations`. For each, we're outputting another component—surprise—which will take in the invite data and display it accordingly. We're doing this as two separate components here because each one will have a slightly different structure. If you're feeling extra dorky you can refactor this even further, but as-it-stands it won't hurt you. So...how is that data piping in?

<p class="block-header">/client/components/authenticated/invites.jsx</p>

```javascript
InvitesList = React.createClass({
  mixins: [ ReactMeteorData ],
  getMeteorData() {
    Meteor.subscribe( 'invites-list' );

    return {
      currentUser: Meteor.user(),
      openInvitations: {
        columns: [
          { width: '5%', label: '', className: '' },
          { width: '53%', label: 'Email Address', className: '' },
          { width: '20%', label: 'Date Requested', className: 'text-center' },
          { width: '20%', label: 'Send Invitation', className: 'text-center' }
        ],
        data: Invites.find( { invited: false }, { sort: { inviteNumber: 1 } } ).fetch()
      },
      closedInvitations: {
        columns: [
          { width: '5%',  label: '', className: '' },
          { width: '40%', label: 'Email Address', className: '' },
          { width: '20%', label: 'Date Invited', className: 'text-center' },
          { width: '15%', label: 'Invite Token', className: 'text-center' },
          { width: '20%', label: 'Accepted?', className: 'text-center' }
        ],
        data: Invites.find( { invited: true }, { sort: { dateInvited: -1 } } ).fetch()
      }
    };
  },
  tabs: [
    { content: '#open-invitations', label: 'Open', active: true },
    { content: '#closed-invitations', label: 'Closed', active: false }
  ],
  render() {
    return <div className="invites">
      <PageHeader label="Invites" />
      <NavTabs context="invite-tabs" tabs={ this.tabs } />
      <TabContent context="invite-tabs" tabs={ this.tabs }>
        <TabPanel active={ true } id="open-invitations">
          <Table context="open-invitations" columns={ this.data.openInvitations.columns }>
            { this.data.openInvitations.data.map( ( invite ) => {
              return <OpenInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
        <TabPanel active={ false } id="closed-invitations">
          <Table context="closed-invitations" columns={ this.data.closedInvitations.columns }>
            { this.data.closedInvitations.data.map( ( invite ) => {
              return <ClosedInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
      </TabContent>
    </div>;
  }
});
```

Well, yeah...okay, but...what in the hell?! This is React. Remember, in addition to using reusable components, the other big tenet of React is that _parents are responsible for passing properties to their children_. Said another way, the component that is including the sub-component is responsible for telling that component what it should display. In our case, we have three big things we're telling other components to display here. 

1. The `<NavTabs />` component is being told which tabs to display by telling it to look at the `tabs` property of our component via `this.tabs`.
2. Our `<Table />` components are being told which columns to render via the `openInvitations.columns` and `closedInvitations.columns` properties returned by `this.data`.
3. Our calls to `map()` are being told what data to loop over (and render as either `<OpenInvitation />` or `<ClosedInvitation />` compoments) by the `data` property set on `this.data.openInvitations.data` and `this.data.closedInvitations.data`.

Let that all soak in as it's a bit heady. Again, all we're doing here is telling our nested components what data to render. That's it. The syntax is a bit new and weird, but this is very similar to what Meteor does with Blaze. For example, our call to `this.data.openInvitations.data.map()` is comparable to something like: 

```handlebars
{{#each openInvitations}}
  {{> Template.dynamic template="OpenInvitation" data=this}}
{{/each}}
```

Seeing the parallels? The major difference between the two patterns is that with React, we keep all of our code in one place (as opposed to separate files). Again, let that soak in. What React is doing is really neat and encouraging us to have much cleaner interfaces. It may not seem like it at first, but a lot of the conventions introduced here will help you to develop better organizational habits. Damn you, Zuckerberg!

One more thing to point out: our subscription. Notice at the very top of our `getMeteorData` method, we're subscribing to a publication called `invites-list`. Let's take a peek at that real quick.

<p class="block-header">/server/publications/invites-list.js</p>

```javascript
Meteor.publish( 'invites-list', function() {
  if ( Roles.userIsInRole( this.userId, 'admin' ) ) {
    return Invites.find();
  }
});
```

Pretty simple, but notice that we're doing something special. Here, we're taking into account that we'll be separating our users into two batches later on: `testers` and `admins`. Because our invites list contains sensitive user data, we use a call to `Roles.userIsInRole()` from the `alanning:roles` package we installed earlier, verifying that the current user `this.userId` is in the `admin` role. If they are, we return our invites data as expected. Note: this means that if someone was sneaky and found our `invites-list` subscription, they couldn't type `Meteor.subscribe( 'invites-list' );` in the console and get back our data! 

Cool, so, at this point, we've got our data wired up and it's ouputting to our components. Next, we need to add a means for _sending_ invitations. Because we'll only be doing this on our open invitations, we're going to add the functionality to our `<OpenInvitation />` component. Remember, this is the one we were outputting in our loop over the `openInvitations.data` collection.

<p class="block-header">/client/components/authenticated/open-invitation.jsx</p>

```javascript
OpenInvitation = React.createClass({
  sendInvitation() {
    if ( confirm( `Are you sure you want to invite ${ this.props.invite.email }?` ) ) {
      Meteor.call( 'sendInvite', this.props.invite._id, ( error ) => {
        if ( error ) {
          alert( error.reason );
        } else {
          alert( 'Invite sent!' );
        }
      });
    }
  },
  render() {
    let invite = this.props.invite;

    return <tr key={ invite._id }>
      <td className="vertical-align"># { invite.inviteNumber }</td>
      <td className="vertical-align">{ invite.email }</td>
      <td className="text-center vertical-align">{ React.helpers.humanDate( invite.requested ) }</td>
      <td className="text-center vertical-align">
        <Button type="button" buttonStyle="success" label="Invite" onClick={ this.sendInvitation } />
      </td>
    </tr>;
  }
});
```

We're keeping it pretty simple here. Notice that all this component is doing is outputting a row for our table. Again, one job per component (if we can manage), breaking bigger components into sub-components like this one. Components. COMPONENTS. Components. Phew. Is your head spinning? Mine is. SO. Here, the part to pay attention to is the `<Button />` component and it's `onClick` property. Notice that this prop is making a call to `this.sendInvitation` which corresponds to a method on our component. Ah, ha!

Up in that method, we're getting straight to the point by throwing a confirm dialog to make sure that our user definitely wants to send an invite. If they answer in the positive, we make a call to our `sendInvite` method on the server. Notice: we're passing our invitation's ID via the `invite` prop on the current instance of our `<OpenInvitation />` component. No way. _Yes way_. Remember, when we looped over our open invitations, we simply passed the current invitation as a prop on `<OpenInvitation />`. Inside of the component, then, we can access the entire invite and do as we please via `this.props.invite`. Here, we want the `_id` of our invite to use as a reference on the server. Let's hop over there now.

<p class="block-header">/server/methods/update/invites.js</p>

```javascript
const urls = {
  development: 'http://localhost:3000/signup/',
  production: 'http://tmc-002-demo.meteor.com/signup/'
};

Meteor.methods({
  sendInvite( inviteId ) {
    check( inviteId, String );

    let invite = Invites.findOne( { _id: inviteId } );

    if ( invite ) {
      SSR.compileTemplate( 'inviteEmail', Assets.getText( 'email/templates/invite.html' ) );

      Email.send({
        to: invite.email,
        from: 'Urkelforce <demo@themeteorchef.com>',
        subject: 'Welcome to Urkelforce!',
        html: SSR.render( 'inviteEmail', {
          url: urls[ process.env.NODE_ENV ] + invite.token
        })
      });

      Invites.update( invite._id, {
        $set: {
          invited: true,
          dateInvited: ( new Date() ).toISOString()
        } 
      });
    } else {
      throw new Meteor.Error( 'not-found', 'Sorry, an invite with that ID could not be found.' );
    }
  }
});
```

A little more wiley, but nothing too crazy. First, we check our `inviteId` from the client to make sure it's a string. Next, we quickly look up our invite to make sure it exists—it should, but just in case. If our invite exists, we use the `meteorhacks:ssr` package that's included with Base to compile a simple, [HTML email template](https://github.com/themeteorchef/adding-a-beta-invitation-system-to-your-meteor-application/blob/v2.0.0/code/private/email/templates/invite.html) we've defined for dispatching invites to our users. Here, we rely on the Meteor `Assets` API to get the text contents of our template, relative to the `/private` directory of our app (i.e. `/private/email/templates/invite.html`).

Once our template is compiled, we make use of the `email` package we installed earlier, calling its `send()` method to fire off our email. Notice, to send our HTML email, we're setting a property  called `html` and passing it a call to `SSR.render()`. What's happening here is that the `ssr` package is taking the data we pass in the object in the second argument and attempting to map it to handlebars-style helpers in our template.

In the template, we have a single helper `{{url}}` which is looking for the fully built URL that we'll link our users to for accepting their invite. Notice that when we set `url`, we're calling to an object defined at the top of our file called `urls` which contains a value for `development` and `production`. This makes it easy for us to switch between environments and still have our code work without a lot of fuss.

Using the built in `process.env.NODE_ENV` value (this is given to us via Node.js, the lower-level system that Meteor runs on top of), we get the current environment our app is running in. On localhost, `process.env.NODE_ENV` is automatically set to `development` for us. In production, we can control this by [setting environment variables on our host](https://themeteorchef.com/recipes/deploying-to-modulus/#tmc-environment-variables). Generally speaking, this is already done for us, but keep an eye on it if you deploy this.

Once our URL is built, we pipe it into our template to replace our `{{url}}` helper accordingly. Behind the scenes, the `ssr` package handles the replacement and conversion of our template into raw HTML, fit for sending off via email!

<div class="note">
  <h3>Configuring Email <i class="fa fa-warning"></i></h3>
  <p>In order for this to work, you will need to <a href="https://themeteorchef.com/snippets/using-the-email-package/#tmc-configuration">configure an SMTP provider</a> in your application. Without one, Meteor will simply output the message for your email to the server console.</p>
</div>

Once this is all set, we make sure to update our actual invitation, marking it as being invited, and setting the `dateInvited` property to the current date in the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format. Blammo! At this point, we've got our invites out the door and updated in our system. If we play around a bit with our app, we should see invites jumping from our "Open" tab to our "Closed" tab. Sweet!

Last step is acepting invites. Let's get to it.

### Accepting invitations and creating users
The grand finale! Right now, we've got all of the basic pieces in place to send invites _out_ to our users. What we want to do to close this loop is give our users a way to _accept_ those invitations. To do this, we're going to create a sign up form that carries the requirement of including a beta token. This will allow us to prevent random users from signing up, while also giving those we _do_ want the proper access. To start, let's whip up a component.

<p class="block-header">/client/components/public/signup.jsx</p>

```javascript
Signup = React.createClass({
  [...]
  render() {
    return <div className="signup">
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">
          <PageHeader label="Signup" />
          <Form ref="signupForm" id="application-signup" className="signup" onSubmit={ this.handleSubmit }>
            <FormGroup>
              <Label name="emailAddress" label="Email Address" />
              <Input ref="emailAddress" type="email" name="emailAddress" placeholder="Email Address" />
            </FormGroup>
            <FormGroup>
              <Label name="password" label="Password" />
              <Input ref="password" type="password" name="password" placeholder="Password" />
            </FormGroup>
            <FormGroup>
              <Label name="betaToken" label="Beta Token" />
              <Input ref="betaToken" type="text" name="betaToken" placeholder="Beta Token" value={ this.props.token } />
            </FormGroup>
            <FormGroup>
              <Button type="submit" buttonStyle="success" label="Sign Up" />
            </FormGroup>
            <p>Already have an account? <a href="/login">Log In</a>.</p>
          </Form>
        </div>
      </div>
    </div>;
  }
});
```

Pssh. Nothing we haven't seen at this point. Notice that we're starting to reap the benefits of using React: reusability. Save for our layout div's via Bootstrap, everything here has already been defined as a component. See the advantage? Without a lot of thought, we save a ton of repetition and speed up our workflow quite a bit. What's interesting is that we could technically refactor this _even further_. For example, here, we have an `emailAddress` input wrapped in a form group. This alone could be a new component called `<EmailAddress />`! 

The reality with React is that it takes some thinking, which is a good thing. By thinking carefully about how we add new elements (or break down existing ones), we make it that much easier to compose our interfaces. In dork-free terms, this means that we can move faster, cooperate easier with team members, and get home sooner. Win. Win. Win. Slow start, fast finish.

Okay, now that we have The React Way™ drilled into our heads, let's rap about this component. All we're doing here is creating a form for our users to fill out. The interesting part revolves around the `betaToken` input. Recall that way back when we set up our routes, we created a variation of our signup route `/signup/:token`. This is where we put it to use. Remember, we plucked that `:token` value out of our route and passed it into our `<Signup />` component via the prop `token`. See how we're making use of it?

On our `betaToken` input, we make a call to `this.props.token`, passing it in as the default value of our input. This means that if the user visits `/signup/123456`, when the page loads, they'll see `123456` in the `betaToken` input field.

<figure>
  <img src="https://tmc-post-content.s3.amazonaws.com/Screen-Shot-2015-12-02-02-39-22.png" alt="Example of our token being passed into the Beta Token input.">
  <figcaption>Example of our token being passed into the Beta Token input.</figcaption>
</figure>

So cool! Now for the final step, getting the user signed up. To do it, we're going to take a cue from our `<Index />` component we set up earlier. Yes, this means a little bit of [hell raising](https://youtu.be/ki3TpFZY7cU?t=1m27s) and using a tiny dash of jQuery to help validate our form. You can send your complaints to:

```text
Facebook Headquarters 
c/o Mark "Adissage" Zuckerberg
1 Hacker Way 
Menlo Park, CA 94025
```

Let's wire this up. 

<p class="block-header">/client/components/public/signup.jsx</p>

```javascript
Signup = React.createClass({
  componentDidMount() {
    let refs = this.refs,
        form = React.findDOMNode( refs.signupForm );

    $( form ).validate({
      rules: {
        emailAddress: { required: true, email: true },
        password: { required: true },
        betaToken: { required: true }
      },
      submitHandler() {
        let password = React.findDOMNode( refs.password ).value,
            user     = {
              email: React.findDOMNode( refs.emailAddress ).value,
              password: Accounts._hashPassword( password ),
              betaToken: React.findDOMNode( refs.betaToken ).value
            };

        Meteor.call( 'validateBetaToken', user, ( error ) => {
          if ( error ) {
            alert( error.reason );
          } else {
            Meteor.loginWithPassword( user.email, password, ( error ) => {
              if ( error ) {
                alert( error.reason );
              } else {
                FlowRouter.go( '/dashboard' );
              }
            });
          }
        });
      }
    });
  },
  handleSubmit( event ) {
    event.preventDefault();
  },
  render() {
    return <div className="signup">
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">
          <PageHeader label="Signup" />
          <Form ref="signupForm" id="application-signup" className="signup" onSubmit={ this.handleSubmit }>
            <FormGroup>
              <Label name="emailAddress" label="Email Address" />
              <Input ref="emailAddress" type="email" name="emailAddress" placeholder="Email Address" />
            </FormGroup>
            <FormGroup>
              <Label name="password" label="Password" />
              <Input ref="password" type="password" name="password" placeholder="Password" />
            </FormGroup>
            <FormGroup>
              <Label name="betaToken" label="Beta Token" />
              <Input ref="betaToken" type="text" name="betaToken" placeholder="Beta Token" value={ this.props.token } />
            </FormGroup>
            <FormGroup>
              <Button type="submit" buttonStyle="success" label="Sign Up" />
            </FormGroup>
            <p>Already have an account? <a href="/login">Log In</a>.</p>
          </Form>
        </div>
      </div>
    </div>;
  }
});
```

Woah smokies. It _is_ a lot, but remember, we're keeping everything in one file. It's bound to look a little bloated. Just like before with our `<Index />` form, we're relying on React's refs concept to fish out and select our DOM elements. We do a quick spot of validation to make sure all of our fields are complete and then defer to our `submitHandler` method on our validation to do the deed.

Here, notice that we're relying heavily on `React.findDOMNode()` to pluck values out of our component. Once we have them, we toss them up the server to validate the token and create our user's account. Real quick, notice that we're separating out our password field here. Why? We'll be using it in two steps: first, we take the password value and hash it using `Accounts._hashPassword` to make it a teensy bit more secure for sending over the wire and then again, to handle the login _after_ our users account is created.

Clever! Notice that we're just piggybacking on what our user enters into the form to log them in as well. Technically we could get this for free by using `Accounts.createUser()` on the client, so if you'd rather go that route, have at it! Let's jump up to the server and take a peek at how we're validating tokens and creating our user.

<p class="block-header">/server/methods/insert/users.js</p>

```javascript
Meteor.methods({
  validateBetaToken( user ) {
    check( user, {
      email: String,
      password: Object,
      betaToken: String
    });

    let invite = Invites.findOne( { email: user.email, token: user.betaToken }, { fields: { "_id": 1 } } );

    if ( invite ) {
      let userId = Accounts.createUser( { email: user.email, password: user.password } );

      Roles.addUsersToRoles( userId, 'tester' );

      Invites.update( invite._id, {
        $set: { accountCreated: true },
        $unset: { token: "" }
      });
    } else {
      throw new Meteor.Error( 'bad-match', 'Hmm, this token doesn\'t match your email. Try again?' );
    }
  }
});
```

We check our user object just to make sure it contains what we're after and then we get to work. Again, we check to make sure that we can find an invitation with both the email entered _and_ the beta token being passed. If we do, we kickoff the signup process by adding a new user. Once we have them, we pass their new `userId` to `Roles.addUsersToRoles()` to add them to the `tester` group—remember, we're filtering based on this in our publications and our `App` component—and then finally update their invite to acknowledge their acceptance!

If we send off an invite to our users now, they'll be able sign up for Urkelforce using their email and password along with their beta token! Done! In case you missed it, when the user's account is created and we log them in back on the client, we also redirect them to `/dashboard`, our "top secret" feature that has VC's climbing over themselves to invest in us. 

Drumroll please…

Annnnnd Carl Winslow dancing. You're welcome. We'll take our payment in $50's and $100's.

![https://media.giphy.com/media/l1UWxyIhsZi8g/giphy.gif](https://media.giphy.com/media/l1UWxyIhsZi8g/giphy.gif)

Just _look at him go_. Moves.

### Wrap Up & Summary

Cool, right? In this recipe, we learned how to collect emails from users on our index page and make it possible to send invites to them using unique Beta Tokens. We looked at using the Random package, rendering a server side email template, and took a solid look at working with reusable components in React. Alright, now it's off to the races. [Y Combinator](https://www.ycombinator.com/) here we come!