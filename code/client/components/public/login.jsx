Login = React.createClass({
  componentDidMount() {
    let refs = this.refs,
        form = React.findDOMNode( refs.loginForm );

    $( form ).validate({
      rules: {
        emailAddress: { required: true, email: true },
        password: { required: true }
      },
      submitHandler() {
        let email    = React.findDOMNode( refs.emailAddress ).value,
            password = React.findDOMNode( refs.password ).value;

        Meteor.loginWithPassword( email, password, ( error ) => {
          if ( error ) {
            alert( error.reason );
          }
        });
      }
    });
  },
  handleSubmit( event ) {
    event.preventDefault();
  },
  render() {
    return <div className="login">
      <div className="row">
        <div className="col-xs-12 col-sm-6 col-md-4">
          <PageHeader label="Login" />
          <Alert type="info">
            To login to the demo, use <strong>steve@urkel.com</strong> for the Email Address and <strong>dididothat</strong> for the Password.
          </Alert>
          <Form ref="loginForm" id="application-login" className="login" onSubmit={ this.handleSubmit }>
            <FormGroup>
              <Label name="email" label="Email Address" />
              <Input ref="emailAddress" type="email" name="emailAddress" label="Email Address" placeholder="Email Address" />
            </FormGroup>
            <FormGroup>
              <Label name="password" label="Password" />
              <Input ref="password" type="password" name="password" label="Password" placeholder="Password" />
            </FormGroup>
            <FormGroup>
              <Button type="submit" label="Login" buttonStyle="success" />
            </FormGroup>
          </Form>
          <p>Don't have an account? <a href="/signup">Sign Up</a>.</p>
        </div>
      </div>
    </div>;
  }
});
