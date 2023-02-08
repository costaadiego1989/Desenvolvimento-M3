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

  let renderFromLocalStorage;

  if (retrieve("selectedProduct")) {
    renderFromLocalStorage = renderFilteredProducts("selectedProduct");
  } else if (retrieve("selectedSize")) {
    renderFromLocalStorage = renderFilteredProducts("selectedSize");
  } else if (retrieve("selectedPrice")) {
    renderFromLocalStorage = renderFilteredProducts("selectedPrice");
  } else if (retrieve("sortByNewest")) {
    renderFromLocalStorage = renderFilteredProducts("sortByNewest");
  } else if (retrieve("sortByBiggestPrice")) {
    renderFromLocalStorage = renderFilteredProducts("sortByBiggestPrice");
  } else if (retrieve("sortByLowerPrice")) {
    renderFromLocalStorage = renderFilteredProducts("sortByLowerPrice");
  }

  for (let product of renderFromLocalStorage || productsArray) {
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
      <a href="javascript:void(0)" id="${product.id}" class="buyNow">COMPRAR</a>
    `;

    attachUl.appendChild(li);
  }

  const btnBuyNow: NodeListOf<HTMLElement> =
    document.querySelectorAll(".buyNow");
  Array.from(btnBuyNow).map((btn) => {
    btn.addEventListener("click", async () => {
      addItemToCart(btn);
    });
  });
}

async function addItemToCart(item: HTMLElement) {
  const
  allProducts = await fetchApi(),
  filteredProducts = allProducts.filter((product) => product.id === item.id);

  var cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(...filteredProducts);
  localStorage.setItem("cart", JSON.stringify(cart));

  reloadPage();
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
    remove("selectedPrice");
    remove("sortByNewest");
    remove("sortByLowerPrice");
    remove("selectedBiggestPrice");

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
    remove("selectedPrice");
    remove("sortByNewest");
    remove("sortByLowerPrice");
    remove("selectedBiggestPrice");

    reloadPage();
  }
}

async function handleFilterByPrice(productsArray: Product[], element: any) {
  const products: Product[] = [];

  const valueFromCheckbox = element.value.split(",");
  const filteredProducts = productsArray.filter(
    (product) =>
      product.price >= +valueFromCheckbox[0] &&
      product.price <= +valueFromCheckbox[1]
  );

  products.push(...products.concat(filteredProducts));

  persist("selectedPrice", products);

  if (retrieve("selectedPrice")) {
    renderFilteredProducts("selectedPrice");
    remove("selectedProduct");
    remove("selectedColor");
    remove("selectedSize");
    remove("sortByNewest");
    remove("sortByLowerPrice");
    remove("selectedBiggestPrice");

    reloadPage();
  }
}

async function handleFilterSortBy(inputValue: string) {
  const productList = await fetchApi();

  let sortByNewest;
  let sortByBiggestPrice;
  let sortByLowerPrice;

  if (inputValue === "newest") {
    sortByNewest = productList
      .map((product) => product)
      .sort((a, b) => {
        if (a.date > b.date) return -1;
        if (a.date < b.date) return 1;
      });

    persist("sortByNewest", sortByNewest);

    if (retrieve("sortByNewest")) {
      renderFilteredProducts("sortByNewest");
      remove("selectedProduct");
      remove("selectedColor");
      remove("selectedSize");
      remove("selectedPrice");
      remove("sortByLowerPrice");
      remove("sortByBiggestPrice");
      reloadPage();
    }
  }

  if (inputValue === "biggestPrice") {
    sortByBiggestPrice = productList
      .map((product) => product)
      .sort((a, b) => {
        if (a.price > b.price) return -1;
        if (a.price < b.price) return 1;
      });

    persist("sortByBiggestPrice", sortByBiggestPrice);

    if (retrieve("sortByBiggestPrice")) {
      renderFilteredProducts("sortByBiggestPrice");
      remove("selectedProduct");
      remove("selectedColor");
      remove("selectedSize");
      remove("selectedPrice");
      remove("sortByNewest");
      remove("sortByLowerPrice");
      reloadPage();
    }
  }

  if (inputValue === "lowerPrice") {
    sortByLowerPrice = productList
      .map((product) => product)
      .sort((a, b) => {
        if (a.price > b.price) return 1;
        if (a.price < b.price) return -1;
      });

    persist("sortByLowerPrice", sortByLowerPrice);

    if (retrieve("sortByLowerPrice")) {
      renderFilteredProducts("sortByLowerPrice");
      remove("selectedProduct");
      remove("selectedColor");
      remove("selectedSize");
      remove("selectedPrice");
      remove("sortByNewest");
      remove("sortByBiggestPrice");
      reloadPage();
    }
  }
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
        value="${product.color}" class="inputColors" />
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
  remove("sortByNewest");
  remove("sortByLowerPrice");
  remove("selectedBiggestPrice");

  reloadPage();
});

(function filterBySize() {
  const sizes: NodeListOf<HTMLElement> = document.querySelectorAll(".size");
  Array.from(sizes).map((size) =>
    size.addEventListener("click", async () => {
      await handleFilterBySize(await fetchApi(), size.innerHTML);
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

(function sortBy() {
  const select = document.getElementById("sortBy") as HTMLInputElement | null;
  select.addEventListener("click", async () => {
    console.log("selected", select.value);
    await handleFilterSortBy(select.value);
  });
})();

(function handleClickBrand() {
  const brand = document.getElementById("brand") as HTMLInputElement;
  brand.style.cursor = "pointer";
  brand.addEventListener("click", () => {
    remove("selectedProduct");
    remove("selectedColor");
    remove("selectedPrice");
    remove("selectedSize");
    remove("sortByNewest");
    remove("sortByLowerPrice");
    remove("selectedBiggestPrice");
    remove("cart");

    reloadPage();
  });
})();

(function showMore() {
  const productsSection = document.querySelector(
    ".products"
  ) as HTMLInputElement;
  const screenWidth = window.innerWidth;
  if (screenWidth > 420) {
    productsSection.style.maxHeight = "1400px";
    productsSection.style.overflow = "hidden";
    productsSection.style.transition = "max-height 1s";
  } else {
    productsSection.style.maxHeight = "820px";
    productsSection.style.overflow = "hidden";
    productsSection.style.transition = "max-height 1s";
  }

  const button = document.querySelector(".btn-loadmore");

  button.addEventListener("click", () => {
    if (productsSection.className == "open") {
      if (screenWidth > 420) {
        productsSection.className = "";
        productsSection.style.maxHeight = "1400px";
        button.innerHTML = "CARREGAR MAIS";
      } else {
        productsSection.className = "";
        productsSection.style.maxHeight = "820px";
        button.innerHTML = "CARREGAR MAIS";
      }
    } else {
      if (screenWidth > 420) {
        productsSection.className = "open";
        productsSection.style.maxHeight = "2350px";
        button.innerHTML = "CARREGAR MENOS";
      } else {
        productsSection.className = "open";
        productsSection.style.maxHeight = "2560px";
        button.innerHTML = "CARREGAR MENOS";
      }
    }
  });
})();

(function itemCountCart() {
  const count = document.querySelector(".item-cart-count");
  count.innerHTML = retrieve("cart")?.length ? retrieve("cart")?.length : 0;
})();

const 
  sortBtn = document.querySelector(".mobileSort"),
  sortMenu = document.querySelector(".mobileSortMenu") as HTMLInputElement,
  closeSortMenuBtn = document.querySelector(".closeSortMenu"),

  filterBtn = document.querySelector(".mobileFilter"),
  filterMenu = document.querySelector(".mobileFilterMenu"),
  closeFilterMenuBtn = document.querySelector(".closeFilterMenu"),

  mobileFilterMenu = document.querySelector(".mobileFilterMenu") as HTMLInputElement;

sortBtn.addEventListener("click", () => {
  sortMenu.classList.remove("dontShow");
  sortMenu.style.position = "fixed";
});

closeSortMenuBtn.addEventListener("click", () => {
  const sortMenu = document.querySelector(".mobileSortMenu");
  sortMenu.classList.add("dontShow");
});

filterBtn.addEventListener("click", () => {
  filterMenu.classList.remove("dontShow");
  mobileFilterMenu.style.position = "fixed";  
});

closeFilterMenuBtn.addEventListener("click", () => {
  const filterMenuMobile = document.querySelector(".mobileFilterMenu");
  filterMenuMobile.classList.add("dontShow");
});

document.addEventListener("DOMContentLoaded", fetchApi);
