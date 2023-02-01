import { Product } from "./Product";

const serverUrl = "http://localhost:5000";

const headers = new Headers();

async function fetchApi() {
  const req = await fetch(`${serverUrl}/products`, {
    method: "GET",
    headers: headers,
    mode: "cors",
    cache: "default",
  })
    .then((response) => response.json())
    .then((data) => console.error(data));

  return req;
};

function main() {
  console.log(serverUrl);
}

document.addEventListener("DOMContentLoaded", fetchApi);
