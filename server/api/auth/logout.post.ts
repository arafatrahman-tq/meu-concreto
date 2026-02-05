export default defineEventHandler((event) => {
  deleteCookie(event, "auth_session", {
    path: "/",
  });
  return {
    message: "Logout realizado com sucesso",
  };
});
