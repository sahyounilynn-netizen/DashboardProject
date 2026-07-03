import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

function HomePage() {
  const [dashboardCards, setDashboardCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardCards(data.cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    async function loadInitialDashboardData() {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardCards(data.cards);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialDashboardData();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Dashboard Project</h1>
        <p>Welcome to our full-stack React dashboard.</p>

        <button onClick={fetchDashboardData}>Refresh Data</button>

        <section>
          <h2>Overview</h2>

          {isLoading && <p>Loading dashboard data...</p>}

          {error && <p>{error}</p>}

          {!isLoading && !error && (
            <div className="cards-grid">
              {dashboardCards.map((card) => (
                <DashboardCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default HomePage;