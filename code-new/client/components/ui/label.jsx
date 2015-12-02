Label = React.createClass({
  render() {
    return <label htmlFor={ this.props.name }>{ this.props.label }</label>;
  }
});
