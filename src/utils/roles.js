export const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  if (value === "admin") return "Admin";
  if (value === "manager") return "Manager";
  if (value === "employee") return "Employee";

  return role || "";
};

export const isAdminRole = (role) => normalizeRole(role) === "Admin";

export const isManagerRole = (role) => normalizeRole(role) === "Manager";

export const isAdminOrManagerRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === "Admin" || normalized === "Manager";
};

export const isAllowedRole = (role, allowedRoles = []) => {
  const normalizedRole = normalizeRole(role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  return normalizedAllowedRoles.includes(normalizedRole);
};
