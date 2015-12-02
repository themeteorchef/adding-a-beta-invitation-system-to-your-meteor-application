Dashboard = React.createClass({
  render() {
    return <div className="dashboard">
      <PageHeader label="Dashboard" />
      <p>Our super secret <a href="http://familymatters.wikia.com/wiki/Carl_Winslow">Carl Winslow</a> gif. Don't tell anyone. Watch out Facebook.</p>
      <p>Just to be safe, I should point out that a real application would (preferrably) have something better than this for their beta testers :p</p>
      <Image src="http://media.giphy.com/media/l1UWxyIhsZi8g/giphy.gif" alt="Carl Winslow dancing." />
    </div>;
  }
});
