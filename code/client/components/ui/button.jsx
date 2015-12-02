Button = React.createClass({
  render() {
    return <button type={ this.props.type } className={ `btn btn-${this.props.buttonStyle}` } onClick={ this.props.onClick }>
      { this.props.label }
    </button>;
  }
});
