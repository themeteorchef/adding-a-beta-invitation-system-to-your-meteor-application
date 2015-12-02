Table = React.createClass({
  render() {
    return <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            { this.props.columns.map( ( column, index ) => {
              return <th className={ column.className } width={ column.width } key={ `${ this.props.context }-column-${ index }` }>
                { column.label }
              </th>;
            })}
          </tr>
        </thead>
        <tbody>
          { this.props.children }
        </tbody>
      </table>
    </div>;
  }
});
