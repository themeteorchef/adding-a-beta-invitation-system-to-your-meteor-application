Input = React.createClass({
  render() {
    return <input
      type={ this.props.type }
      name={ this.props.name }
      className="form-control"
      placeholder={ this.props.placeholder }
      defaultValue={ this.props.value }
    />;
  }
});
