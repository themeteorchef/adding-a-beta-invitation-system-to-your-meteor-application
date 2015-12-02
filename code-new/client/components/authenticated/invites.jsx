InvitesList = React.createClass({
  mixins: [ ReactMeteorData ],
  getMeteorData() {
    Meteor.subscribe( 'invites-list' );

    return {
      currentUser: Meteor.user(),
      openInvitations: {
        columns: [
          { width: '5%', label: '', className: '' },
          { width: '53%', label: 'Email Address', className: '' },
          { width: '20%', label: 'Date Requested', className: 'text-center' },
          { width: '20%', label: 'Send Invitation', className: 'text-center' }
        ],
        data: Invites.find( { invited: false }, { sort: { inviteNumber: 1 } } ).fetch()
      },
      closedInvitations: {
        columns: [
          { width: '5%',  label: '', className: '' },
          { width: '40%', label: 'Email Address', className: '' },
          { width: '20%', label: 'Date Invited', className: 'text-center' },
          { width: '15%', label: 'Invite Token', className: 'text-center' },
          { width: '20%', label: 'Accepted?', className: 'text-center' }
        ],
        data: Invites.find( { invited: true }, { sort: { dateInvited: -1 } } ).fetch()
      }
    };
  },
  tabs: [
    { content: '#open-invitations', label: 'Open', active: true },
    { content: '#closed-invitations', label: 'Closed', active: false }
  ],
  render() {
    return <div className="invites">
      <PageHeader label="Invites" />
      <NavTabs context="invite-tabs" tabs={ this.tabs } />
      <TabContent context="invite-tabs" tabs={ this.tabs }>
        <TabPanel active={ true } id="open-invitations">
          <Table context="open-invitations" columns={ this.data.openInvitations.columns }>
            { this.data.openInvitations.data.map( ( invite ) => {
              return <OpenInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
        <TabPanel active={ false } id="closed-invitations">
          <Table context="closed-invitations" columns={ this.data.closedInvitations.columns }>
            { this.data.closedInvitations.data.map( ( invite ) => {
              return <ClosedInvitation key={ invite._id } invite={ invite } />;
            })}
          </Table>
        </TabPanel>
      </TabContent>
    </div>;
  }
});
