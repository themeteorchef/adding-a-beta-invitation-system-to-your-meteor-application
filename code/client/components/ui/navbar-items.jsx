NavbarItems = React.createClass({
  render() {
    let position = this.props.position ? this.props.position : '',
        classes  = `nav navbar-nav ${ position }`;

    return <ul className={ classes }>
      { this.props.children }
    </ul>;
  }
});
