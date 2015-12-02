OpenInvitation = React.createClass({
  sendInvitation() {
    if ( confirm( `Are you sure you want to invite ${ this.props.invite.email }?` ) ) {
      Meteor.call( 'sendInvite', this.props.invite._id, ( error ) => {
        if ( error ) {
          alert( error.reason );
        } else {
          alert( 'Invite sent!' );
        }
      });
    }
  },
  render() {
    let invite = this.props.invite;

    return <tr key={ invite._id }>
      <td className="vertical-align"># { invite.inviteNumber }</td>
      <td className="vertical-align">{ invite.email }</td>
      <td className="text-center vertical-align">{ React.helpers.humanDate( invite.requested ) }</td>
      <td className="text-center vertical-align">
        <Button type="button" buttonStyle="success" label="Invite" onClick={ this.sendInvitation } />
      </td>
    </tr>;
  }
});
