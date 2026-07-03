function getDashboardCards(range) {
  return [
    {
      title: "Total Users",
      value: Math.floor(Math.random() * 1000 + 1000).toString(),
    },
    {
      title: "Total Tasks",
      value: Math.floor(Math.random() * 30 + 1).toString(),
    },
    {
      title: "Pending Requests",
      value: Math.floor(Math.random() * 10 + 1).toString(),
    },
    {
      title: "Selected Range",
      value: range,
    },
  ];
}

module.exports = {
  getDashboardCards,
};