Image = React.createClass({
  render() {
    return <img src={ this.props.src } className={ this.props.className } alt={ this.props.alt} />;
  }
});
