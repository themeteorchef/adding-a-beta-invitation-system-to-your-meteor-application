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
