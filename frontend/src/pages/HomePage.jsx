import { useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

function HomePage() {
  const [dashboardCards, setDashboardCards] = useState([
    { title: "Total Users", value: "1,240" },
    { title: "Total Tasks", value: "18" },
    { title: "Pending Requests", value: "6" },
  ]);

  function handleRefreshData() {
    setDashboardCards([
      { title: "Total Users", value: "1,315" },
      { title: "Total Tasks", value: "22" },
      { title: "Pending Requests", value: "4" },
    ]);
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Dashboard Project</h1>
        <p>Welcome to our full-stack React dashboard.</p>

        <button onClick={handleRefreshData}>Refresh Data</button>

        <section>
          <h2>Overview</h2>

          <div className="cards-grid">
            {dashboardCards.map((card) => (
              <DashboardCard
                key={card.title}
                title={card.title}
                value={card.value}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;