const message: string = "Привет, TypeScript!";
const app = document.getElementById("app");

if (app) {
  app.innerHTML = `<h1>${message}</h1>`;
}
