ClosedInvitation = React.createClass({
  render() {
    let invite = this.props.invite;

    return <tr key={ this.props._id }>
      <td># { invite.inviteNumber }</td>
      <td className="vertical-align">{ invite.email }</td>
      <td className="text-center vertical-align">{ React.helpers.humanDate( invite.dateInvited ) }</td>
      <td className="text-center vertical-align">{ invite.token ? invite.token : 'Already used' }</td>
      <td className="text-center vertical-align">{ invite.accountCreated ? 'Yes' : 'No' }</td>
    </tr>;
  }
});
