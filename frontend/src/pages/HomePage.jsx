import Sidebar from "../components/Sidebar";
import DashboardCard from "../components/DashboardCard";

function HomePage() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <h1>Dashboard Project</h1>
        <p>Welcome to our full-stack React dashboard.</p>

        <section>
          <h2>Overview</h2>

          <div className="cards-grid">
            <DashboardCard title="Total Users" value="1,240" />
            <DashboardCard title="Total Tasks" value="18" />
            <DashboardCard title="Pending Requests" value="6" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;