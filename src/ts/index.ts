import { Product } from "./Product";
import * as $ from "jquery";

const serverUrl = "http://localhost:5000";

const headers = new Headers();

function renderProducts(productsArray: Product[]) {
  const ul = document.createElement("ul");
  const attachUl = document.querySelector(".products").appendChild(ul);

  for (let product of productsArray) {
    const li: any = document.createElement("li");
    li.classList.add("product");

    li.innerHTML =
      li.innerHTML +
      ` 
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>R$${product.price.toFixed(2).toString().replace(".", ",")}</p>
      <p>em até ${product.parcelamento[0]}x de R$${product.parcelamento[1]
        .toFixed(2)
        .toString()
        .replace(".", ",")}</p>
      <a href="#">COMPRAR</a>
    `;

    attachUl.appendChild(li);

    $(".product").slice(9, 14).hide();
    $(".btn-loadmore").on("click", () => {
      $(".product").slice(0, 15).fadeIn();
      $(this).fadeOut();
      $(".btn-loadmore").hide();
    });
  }
}

function handleFilterByColor(productsArray: Product[], element: any) {
  const products: Product[] = [];
  const filterProduct = productsArray.find(
    (product) => product.color === element.value
  );
  products.push(...products, filterProduct);
  window.localStorage.setItem('filteredProducts', JSON.stringify(products));
  const win: Window = window;
  win.location = "/";
  console.log("filterProduct", filterProduct);
}

function renderColors(productsArray: Product[]) {
  const ul = document.createElement("ul");
  const attachUl = document.querySelector(".productsColors").appendChild(ul);

  const setColors = new Set();

  const filteredProducts = productsArray.filter((product) => {
    const duplicatedPerson = setColors.has(product.color);
    setColors.add(product.color);
    return !duplicatedPerson;
  });

  let count = 0;

  for (let product of filteredProducts) {
    let li: any = document.createElement("li");
    li.classList.add("color");

    li.innerHTML =
      li.innerHTML +
      `<li>
        <input type="checkbox" id="myCheckbox${(count = count + 1)}" name="${product.color}"
        value="${product.color}" data-set="${product.color}" />
        <label for="${product.color}">${product.color}</label>
      </li>`;

    attachUl.appendChild(li);
  }

  var inputs = $('[type="checkbox"]');
  inputs.on("click", function () {
    inputs.get().forEach(function (el) {
      el.checked = el == this && this.checked;
    }, this);
  });

  $("#myCheckbox1")
    .add("#myCheckbox2")
    .add("#myCheckbox3")
    .add("#myCheckbox4")
    .add("#myCheckbox5")
    .add("#myCheckbox6")
    .on("change", function () {
      handleFilterByColor(productsArray, this);
    });
}

function renderSizes(productsArray: Product[]) {
  var sizesList = document.querySelector(".productsSizes").innerHTML;

  const setSizes = new Set();

  const filteredProducts = productsArray.filter((product) => {
    const duplicatedPerson = setSizes.has(product.size[0] || product.size[1]);
    setSizes.add(product.size[0]);
    setSizes.add(product.size[1]);
    return !duplicatedPerson;
  });

  for (let product of filteredProducts) {
    sizesList =
      sizesList +
      `<li value=${product.size}>
        ${product.size[0]}
      </li>
      <li value=${product.size}>
        ${product.size[1] ? product.size[1] : "38"}
      </li>`;

    var sizesList = (document.querySelector(".productsSizes").innerHTML =
      sizesList);
  }

  return sizesList;
}

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

  renderProducts(productsArray);

  renderColors(productsArray);

  renderSizes(productsArray);
}

document.addEventListener("DOMContentLoaded", fetchApi);
