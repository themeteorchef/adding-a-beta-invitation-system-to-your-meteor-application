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
