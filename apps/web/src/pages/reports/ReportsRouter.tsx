import { useMemo } from "react";
import ReportsUser from "./UserReports";
import ReportsOrg from "./OrgReports";
import ReportsAdmin from "./AdminReports";

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("treke_user") || "{}"); }
  catch { return null; }
}

export default function ReportsRouter() {
  const user = getCurrentUser();

  const role = useMemo(() => {
    // Prioriza rol explícito si lo guardas: "admin" | "org" | "user"
    const explicit = user?.rol || user?.role || user?.rol_name;
    if (explicit) return String(explicit).toLowerCase();

    // Fallbacks prácticos si aún no guardas rol:
    if ((user?.email || "").startsWith("admin.treke")) return "admin";
    // si estás usando rol_id: 1=admin, 2=org/ong, 3=user (ejemplo)
    if (user?.rol_id === 1) return "admin";
    if (user?.rol_id === 2) return "org";
    return "user";
  }, [user]);

  if (role === "admin") return <ReportsAdmin />;
  if (role === "org" || role === "emprendedor" || role === "ong") return <ReportsOrg />;
  return <ReportsUser />;
}
