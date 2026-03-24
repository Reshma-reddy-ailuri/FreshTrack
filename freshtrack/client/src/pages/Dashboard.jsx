import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://freshtrack-6jri.onrender.com/api/freshtrack";

export default function Dashboard() {
  const [data, setData] = useState({
    total_skus: 0,
    expiring_7: 0,
    expiring_30: 0,
    expired: 0,
    revenue_at_risk: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE}/dashboard`);
        console.log("Dashboard API response:", res.data); // debug
        setData(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <h2 style={{ color: "white" }}>Loading...</h2>;
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1>Dashboard</h1>

      <div style={{ marginTop: "20px" }}>
        <h3>Expiring Soon (7 days)</h3>
        <p>{data.expiring_7}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Expiring in 30 days</h3>
        <p>{data.expiring_30}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Expired</h3>
        <p>{data.expired}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Total Products</h3>
        <p>{data.total_skus}</p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Revenue at Risk</h3>
        <p>₹ {data.revenue_at_risk}</p>
      </div>
    </div>
  );
}