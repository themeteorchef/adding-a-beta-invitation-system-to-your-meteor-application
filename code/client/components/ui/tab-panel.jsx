TabPanel = React.createClass({
  render() {
    let classes = this.props.active ? 'tab-pane active' : 'tab-pane';

    return <div role="tabpanel" className={ classes } id={ this.props.id }>
      { this.props.children }
    </div>;
  }
});
