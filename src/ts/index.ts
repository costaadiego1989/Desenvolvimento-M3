import { Product } from "./Product";
import * as $ from "jquery";

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

  renderProducts(productsArray);

  renderColors(productsArray);

  return productsArray;
}

function reloadPage(): void {
  return window.location.reload();
}

function persist(key: string, value: string | Product[]) {
  return localStorage.setItem(key, JSON.stringify(value));
}

function retrieve(key: string) {
  return JSON.parse(window.localStorage.getItem(key));
}

function remove(key: string): void {
  return window.localStorage.removeItem(key);
}

function renderFilteredProducts(key: string) {
  return retrieve(key);
}

function renderProducts(productsArray: Product[]) {
  const ul = document.createElement("ul");
  const attachUl = document.querySelector(".products").appendChild(ul);

  const verifyIfKeyExistInLocalStorage = retrieve("selectedProduct");
  console.log("verifyIfKeyExistInLocalStorage", verifyIfKeyExistInLocalStorage);

  const renderFromLocalStorage = verifyIfKeyExistInLocalStorage
    ? renderFilteredProducts("selectedProduct")
    : renderFilteredProducts("selectedSize");

  for (let product of renderFromLocalStorage || !verifyIfKeyExistInLocalStorage && productsArray) {
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

  products.push(...products.concat(filterProduct));

  persist("selectedProduct", products);
  persist("selectedColor", element.value);

  if (retrieve("selectedProduct")) {
    renderFilteredProducts("selectedProduct");
    remove("selectedSize");
    reloadPage();
  }
}

function handleFilterBySize(productsArray: Product[], element: any) {
  const products: Product[] = [];

  const filterProduct = productsArray.filter((product) => {
    return product.size.includes(element);
  });

  products.push(...products.concat(filterProduct));

  persist("selectedSize", products);

  if (retrieve("selectedSize")) {
    renderFilteredProducts("selectedSize");
    remove("selectedProduct");
    remove("selectedColor");
    reloadPage();
  }
}

async function handleFilterByPrice(productsArray: Product[], element: any) {
  const products: Product[] = [];

  console.log("element", element);

  const filterProduct = productsArray.filter((product) => {
    return product.price >= element;
  });

  products.push(...products.concat(filterProduct));

  console.log("products", products);

  // persist("selectedPrice", products);

  // if (retrieve("selectedSize")) {
  //   renderFilteredProducts("selectedSize");
  //   remove("selectedProduct");
  //   remove("selectedColor");
  //   reloadPage();
  // }
}

function renderColors(productsArray: Product[]) {
  const ul = document.createElement("ul");
  const attachUl = document.querySelector(".productsColors").appendChild(ul);

  const setColors = new Set();
  const sortByColorsName = productsArray.sort((a, b) => {
    if (a.color < b.color) {
      return -1;
    } else {
      return;
    }
  });

  const filteredProducts = sortByColorsName.filter((product) => {
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
      `<li style="display: flex; align-items: center; margin-bottom: 0.25rem;">
        <input type="checkbox" ${
          retrieve("selectedColor")?.includes(product.color) ? "checked" : null
        } id="myCheckbox${(count = count + 1)}" name="${product.color}"
        value="${product.color}" />
        <label style="margin-left: 0.5rem" for="${product.color}">${
        product.color
      }</label>
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

document.querySelector(".clearFilters").addEventListener("click", () => {
  remove("selectedProduct");
  remove("selectedColor");

  reloadPage();
});

(function filterBySize() {
  const selectedSize = (retrieve("selectedSize")) ? retrieve("selectedSize") : null;
  console.log("selectedSize", selectedSize[0].size.pop());
  

  const sizes = document.querySelectorAll(".size");
  Array.from(sizes).map((size) =>
    size.addEventListener("click", async () => {
      console.log("size", size.value);

      await handleFilterBySize(await fetchApi(), size.innerHTML);
      size.classList.add("active");

    })
  );
})();

(function filterByPrice() {
  const prices = document.querySelectorAll(".price");
  Array.from(prices).map((price) =>
    price.addEventListener("click", async () => {
      const typePrice: any = price;
      await handleFilterByPrice(await fetchApi(), typePrice);
    })
  );
})();

document.addEventListener("DOMContentLoaded", fetchApi);
