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
    .then((data) => data);

  let productsArray: Product[] = [];

  for (let products of req) {
    productsArray.push(products);
  }

  var list = document.querySelector('.products').innerHTML;
  
  for (let product of productsArray) {
     list = list + `<li>
     <img src="${product.image}" alt="${product.name}" />
     <h3>${product.name}</h3>
     <p>R$${product.price.toFixed(2).toString().replace(".", ",")}</p>
     <p>em até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2).toString().replace(".", ",")}</p>
     <a href="#">COMPRAR</a>
   </li>`
     var list = document.querySelector('.products').innerHTML = list;
  }

  return list;
}


document.addEventListener("DOMContentLoaded", fetchApi);
