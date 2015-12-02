Alert = React.createClass({
  render() {
    let classes = `alert alert-${ this.props.type }`;
    return <p className={ classes }>{ this.props.children }</p>;
  }
});
