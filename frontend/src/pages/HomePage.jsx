import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

function HomePage() {
  const [dashboardCards, setDashboardCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRange, setSelectedRange] = useState("today");

  async function fetchDashboardData() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/dashboard?range=${selectedRange}`
      );

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

  async function testInvalidRange() {
  try {
    setIsLoading(true);
    setError("");

    const response = await fetch(
      "http://localhost:5000/api/dashboard?range=random"
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
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
        const response = await fetch(
          "http://localhost:5000/api/dashboard?range=today"
        );

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
        <button onClick={testInvalidRange}>Test Invalid Range</button>

        <select
          value={selectedRange}
          onChange={(event) => setSelectedRange(event.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>

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