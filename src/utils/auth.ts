export const getPermissions = () => {
  const perms = localStorage.getItem("permissions");
  
  
  console.log("? getPermissions() called");
  console.log("? raw localStorage permissions:", perms);

  const parsed = perms ? JSON.parse(perms) : [];

  console.log("? parsed permissions:", parsed);
  
  return perms ? JSON.parse(perms) : [];
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getRole = () => {
  return localStorage.getItem("role");
};