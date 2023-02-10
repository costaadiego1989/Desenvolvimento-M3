import { Product } from "./Product";
import * as $ from "jquery";

const serverUrl = "http://localhost:5000";

const headers = new Headers();

class FetchAPI {
  constructor() {}

  async request(): Promise<Product[]> {
    try {
      const response = await fetch(`${serverUrl}/products`, {
        method: "GET",
        headers: headers,
        mode: "cors",
        cache: "default",
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async productsList(): Promise<Product[]> {
    try {
      const productsList = await this.request();
      const productsArray = [...productsList];

      shopping.renderProducts(productsList);
      shopping.renderColors(productsList);

      return productsList;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}

const initialize = new FetchAPI();

class Services {
  constructor() {}

  reloadPage(): void {
    window.location.reload();
  }

  persist(persistKey: string, persistValue: string | Product[]): void {
    localStorage.setItem(persistKey, JSON.stringify(persistValue));
  }

  retrieve(retrieveKey: string): any {
    return JSON.parse(localStorage.getItem(retrieveKey) || "null");
  }

  remove(removeKey: string): void {
    localStorage.removeItem(removeKey);
  }

  renderFilteredProducts(renderKey: string): any {
    return this.retrieve(renderKey);
  }

  selectHTMLItem(selectKey: string): HTMLElement {
    return document.querySelector(selectKey);
  }

  selectAllHTMLItems(selectKey: string) {
    return document.querySelectorAll(selectKey) as NodeListOf<HTMLInputElement>;
  }
}

const services = new Services();
class Shopping extends Services {
  constructor() {
    super();
  }

  async renderProducts(productsArray: Product[]): Promise<void> {
    const ul = document.createElement("ul");
    this.selectHTMLItem(".products").appendChild(ul);

    const filteredProducts = await this.getFilteredProducts(productsArray);
    const renderedProducts = filteredProducts || productsArray;

    for (const product of renderedProducts) {
      const li = document.createElement("li");
      li.classList.add("product");

      li.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>
          R$${product.price.toFixed(2).toString().replace(".", ",")}
        </p>
        <p>
          em até ${product.parcelamento[0]}x de R$${product.parcelamento[1].toFixed(2).toString().replace(".", ",")}
        </p>
        <button id="${product.id}" class="buyNow">COMPRAR</button>
      `;

      ul.appendChild(li);
    }

    await this.addItemToCart();
  }

  private async getFilteredProducts(productsArray: Product[]): Promise<Product[] | null> {
    if (this.retrieve("selectedProduct")) {
      return this.renderFilteredProducts("selectedProduct");
    }
    if (this.retrieve("selectedSize")) {
      return this.renderFilteredProducts("selectedSize");
    }
    if (this.retrieve("selectedPrice")) {
      return this.renderFilteredProducts("selectedPrice");
    }
    if (this.retrieve("sortByNewest")) {
      return this.renderFilteredProducts("sortByNewest");
    }
    if (this.retrieve("sortByBiggestPrice")) {
      return this.renderFilteredProducts("sortByBiggestPrice");
    }
    if (this.retrieve("sortByLowerPrice")) {
      return this.renderFilteredProducts("sortByLowerPrice");
    }
    return null;
  }

  private async addItemToCart(): Promise<void> {
    const btnBuyNow = this.selectAllHTMLItems(".buyNow") as NodeListOf<HTMLButtonElement>;

    for (const btn of btnBuyNow) {
      btn.addEventListener("click", async () => {
        const allProducts = await initialize.productsList();
        const filteredProducts = allProducts.filter((product) => product.id === btn.id);

        let cart = JSON.parse(localStorage.getItem("cart") || "[]");
        cart = [...cart, ...filteredProducts];
        this.persist("cart", cart);

        this.reloadPage();
      });
    }
  }

  renderColors(productsArray: Product[]): void {
    const ul = document.createElement("ul");
    let attachUl, attachUlMobile;

    if (window.innerWidth <= 420) {
      attachUlMobile = this.selectHTMLItem(".productsColorsMobile").appendChild(
        ul
      );
    } else {
      attachUl = this.selectHTMLItem(".productsColors").appendChild(ul);
    }

    const setColors = new Set();
    const sortByColorsName = productsArray.sort((a, b) => {
      if (a.color < b.color) {
        return -1;
      } else {
        return;
      }
    });

    const filteredProducts = sortByColorsName.filter((product) => {
      const duplicatedColor = setColors.has(product.color);
      setColors.add(product.color);
      return !duplicatedColor;
    });

    let count = 0;

    for (let product of filteredProducts) {
      let li: any = document.createElement("li");
      li.classList.add("color");

      li.innerHTML =
        li.innerHTML +
        `
          <input type="checkbox" ${
            services.retrieve("selectedColor")?.includes(product.color)
              ? "checked"
              : null
          }
          id="myCheckbox" name="${product.color}"
          value="${product.color}" class="inputColors" />
          <label style="margin-left: 0.5rem" for="${product.color}">
            ${product.color}
          </label>
        `;

      if (window.innerWidth <= 420) {
        attachUlMobile.appendChild(li);
      } else {
        attachUl.appendChild(li);
      }
    }

    let inputs = $('[type="checkbox"]');
    inputs.on("click", function () {
      inputs.get().forEach(function (el) {
        el.checked = el == this && this.checked;
      }, this);
    });

    const checkBoxes: NodeListOf<HTMLElement> =
    this.selectAllHTMLItems("#myCheckbox");

    Array.from(checkBoxes).map((checkbox) => {
      checkbox.addEventListener("change", () => {
        const checkedBox: any = checkbox;
        this.handleFilterByColor(productsArray, checkedBox);
      });
    });

    this.selectHTMLItem(".clearFilters").addEventListener("click", () => {
      this.remove("selectedProduct");
      this.remove("selectedColor");
      this.remove("sortByNewest");
      this.remove("sortByLowerPrice");
      this.remove("selectedBiggestPrice");

      this.reloadPage();
    });
  }

  async handleFilterByColor(productsArray: Product[], element: any): Promise<void> {
    const products: Product[] = [];

    const filterProduct = await productsArray.filter(
      (product) => product.color === element.value
    );    

    products.push(...products.concat(filterProduct));

    this.persist("selectedProduct", products);
    this.persist("selectedColor", element.value);

    if (this.retrieve("selectedProduct")) {
      this.renderFilteredProducts("selectedProduct");
      this.remove("selectedSize");
      this.remove("selectedPrice");
      this.remove("sortByNewest");
      this.remove("selectedCriteriaSize");
      this.remove("selectedCriteriaPrice");
      this.remove("sortByLowerPrice");
      this.remove("sortByBiggestPrice");
      this.remove("selectedBiggestPrice");

      if (window.innerWidth > 420) this.reloadPage();
    }
  }

  handleFilterBySize(productsArray: Product[], element: any): void {
    const products: Product[] = [];

    const filterProduct = productsArray.filter((product) => {
      return product.size.includes(element);
    });

    products.push(...products.concat(filterProduct));

    this.persist("selectedSize", products);
    this.persist("selectedCriteriaSize", element);

    const 
      selectAllSizes = this.selectAllHTMLItems(".size") as NodeListOf<HTMLInputElement>,
      AllSizesToArray = Array.from(selectAllSizes).map((item) => item.innerHTML),
      selectAllSizesText = Array.from(selectAllSizes).map((item) => item),
      filterBySizeCriteria: any = AllSizesToArray.filter(sizes => sizes === this.retrieve("selectedCriteriaSize"))[0],
      matchSizeCriteria = AllSizesToArray.some(size => size === filterBySizeCriteria);

    if (this.retrieve("selectedSize")) {
      this.renderFilteredProducts("selectedSize");
      this.remove("selectedProduct");
      this.remove("selectedCriteriaPrice");
      this.remove("selectedColor");
      this.remove("selectedPrice");
      this.remove("sortByNewest");
      this.remove("sortByLowerPrice");
      this.remove("sortByBiggestPrice");
      this.remove("selectedBiggestPrice");

      if (window.innerWidth > 420) this.reloadPage();
    }
  }

  handleFilterByPrice(productsArray: Product[], element: any): void {
    const products: Product[] = [];

    const valueFromCheckbox = element.value.split(",");
    const filteredProducts = productsArray.filter(
      (product) =>
        product.price >= +valueFromCheckbox[0] &&
        product.price <= +valueFromCheckbox[1]
    );

    products.push(...products.concat(filteredProducts));

    this.persist("selectedPrice", products);
    this.persist("selectedCriteriaPrice", element.value);

    if (this.retrieve("selectedPrice")) {
      this.renderFilteredProducts("selectedPrice");
      this.remove("selectedProduct");
      this.remove("selectedCriteriaSize");
      this.remove("selectedColor");
      this.remove("selectedSize");
      this.remove("sortByNewest");
      this.remove("sortByLowerPrice");
      this.remove("selectedBiggestPrice");

      if (window.innerWidth > 420) this.reloadPage();
    }
  }

  async handleFilterSortBy(inputValue: string): Promise<void> {
    const productList = await initialize.productsList();

    let sortByNewest;
    let sortByBiggestPrice;
    let sortByLowerPrice;

    if (inputValue === "newest" || inputValue === "Mais recente") {
      sortByNewest = productList
        .map((product) => product)
        .sort((a, b) => {
          if (a.date > b.date) return -1;
          if (a.date < b.date) return 1;
        });

      this.persist("sortByNewest", sortByNewest);

      if (this.retrieve("sortByNewest")) {
        this.renderFilteredProducts("sortByNewest");
        this.remove("selectedProduct");
        this.remove("selectedColor");
        this.remove("selectedSize");
        this.remove("selectedPrice");
        this.remove("sortByLowerPrice");
        this.remove("sortByBiggestPrice");
        this.reloadPage();
      }
    }

    if (inputValue === "biggestPrice" || inputValue === "Maior preço") {
      sortByBiggestPrice = productList
        .map((product) => product)
        .sort((a, b) => {
          if (a.price > b.price) return -1;
          if (a.price < b.price) return 1;
        });

      this.persist("sortByBiggestPrice", sortByBiggestPrice);

      if (this.retrieve("sortByBiggestPrice")) {
        this.renderFilteredProducts("sortByBiggestPrice");
        this.remove("selectedProduct");
        this.remove("selectedColor");
        this.remove("selectedSize");
        this.remove("selectedPrice");
        this.remove("sortByNewest");
        this.remove("sortByLowerPrice");
        this.reloadPage();
      }
    }

    if (inputValue === "lowerPrice" || inputValue === "Menor preço") {
      sortByLowerPrice = productList
        .map((product) => product)
        .sort((a, b) => {
          if (a.price > b.price) return 1;
          if (a.price < b.price) return -1;
        });

      this.persist("sortByLowerPrice", sortByLowerPrice);

      if (this.retrieve("sortByLowerPrice")) {
        this.renderFilteredProducts("sortByLowerPrice");
        this.remove("selectedProduct");
        this.remove("selectedColor");
        this.remove("selectedSize");
        this.remove("selectedPrice");
        this.remove("sortByNewest");
        this.remove("sortByBiggestPrice");
        this.reloadPage();
      }
    }
  }

  filterBySize(): void {
    const sizes: NodeListOf<HTMLElement> = this.selectAllHTMLItems(".size");
    Array.from(sizes).map((size) =>
      size.addEventListener("click", async () => {
        this.handleFilterBySize(
          await initialize.productsList(),
          size.innerHTML
        );
      })
    );
  }

  filterByPrice(): void {
    const prices = this.selectAllHTMLItems(".price");
    Array.from(prices).map((price) =>
      price.addEventListener("click", async () => {
        const typePrice: any = price;
        shopping.handleFilterByPrice(
          await initialize.productsList(),
          typePrice
        );
      })
    );
  }

  sortBy(): void {
    const select = document.getElementById("sortBy") as HTMLInputElement | null;
    select.addEventListener("click", async () => {
      console.log("selected", select.value);
      await shopping.handleFilterSortBy(select.value);
    });
  }

  handleClickBrandAndResetStorage(): void {
    const brand = document.getElementById("brand") as HTMLInputElement;
    brand.style.cursor = "pointer";
    brand.addEventListener("click", () => {
      this.remove("selectedProduct");
      this.remove("selectedColor");
      this.remove("selectedPrice");
      this.remove("selectedSize");
      this.remove("sortByNewest");
      this.remove("sortByLowerPrice");
      this.remove("selectedBiggestPrice");
      this.remove("cart");

      this.reloadPage();
    });
  }

  showMore(): void {
    const productsSection = this.selectHTMLItem(
      ".products"
    ) as HTMLInputElement;
    const screenWidth = window.innerWidth;
    if (screenWidth > 420) {
      productsSection.style.maxHeight = "1370px";
      productsSection.style.overflow = "hidden";
      productsSection.style.transition = "max-height 1s";
    } else {
      productsSection.style.maxHeight = "820px";
      productsSection.style.overflow = "hidden";
      productsSection.style.transition = "max-height 1s";
    }

    const button = this.selectHTMLItem(".btn-loadmore");

    button.addEventListener("click", () => {
      if (productsSection.className == "open") {
        if (screenWidth > 420) {
          productsSection.className = "";
          productsSection.style.maxHeight = "1370px";
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
  }

  itemCountCart() {
    const count = this.selectHTMLItem(".item-cart-count");
    count.innerHTML = services.retrieve("cart")?.length
      ? services.retrieve("cart")?.length
      : 0;
  }

  initializeMenuMobile(): void {
    const sortBtn = this.selectHTMLItem(".mobileSort"),
      sortMenu = this.selectHTMLItem(".mobileSortMenu") as HTMLInputElement,
      closeSortMenuBtn = this.selectHTMLItem(".closeSortMenu"),
      filterBtn = this.selectHTMLItem(".mobileFilter"),
      filterMenu = this.selectHTMLItem(".mobileFilterMenu") as HTMLInputElement,
      closeFilterMenuBtn = this.selectHTMLItem(".closeFilterMenu"),
      filterByColor = this.selectHTMLItem(".colors") as HTMLInputElement,
      filterBySize = this.selectHTMLItem(".filterBySize") as HTMLInputElement,
      filterByPrice = this.selectHTMLItem(".filterByPrice") as HTMLInputElement;

    sortBtn.addEventListener("click", () => {
      sortMenu.classList.remove("dontShow");
      sortMenu.style.overflowX = "scroll";
    });

    closeSortMenuBtn.addEventListener("click", () => {
      const sortMenu = this.selectHTMLItem(".mobileSortMenu");
      sortMenu.classList.add("dontShow");
    });

    filterBtn.addEventListener("click", () => {
      filterMenu.classList.remove("dontShow");
      filterMenu.style.overflowX = "scroll";
    });

    closeFilterMenuBtn.addEventListener("click", () => {
      const filterMenuMobile = this.selectHTMLItem(".mobileFilterMenu");
      filterMenuMobile.classList.add("dontShow");
      services.reloadPage();
    });

    filterByColor.addEventListener("click", () => {
      const inputColor = this.selectHTMLItem(".inputColor");
      inputColor.classList.remove(".inputColor");
      inputColor.classList.toggle("showCheckboxFilters");
    });

    filterBySize.addEventListener("click", () => {
      const inputSize = this.selectHTMLItem(".inputSize");
      inputSize.classList.remove(".inputSize");
      inputSize.classList.toggle("showCheckboxFilters");
    });

    filterByPrice.addEventListener("click", () => {
      const inputPrice = this.selectHTMLItem(".inputPrice");
      inputPrice.classList.remove(".inputPrice");
      inputPrice.classList.toggle("showCheckboxFilters");
    });

    const sortMobileMenu: NodeListOf<Element> =
    this.selectAllHTMLItems(".sortMobileMenu li");

    Array.from(sortMobileMenu).map((item) => {
      item.addEventListener("click", () => {
        const sort: any = item;
        shopping.handleFilterSortBy(sort.innerHTML);
      });
    });
  }

  multipleCriteria(): void {
    const
      selectAllSizes = this.selectAllHTMLItems(".size"),
      catchSizeCriteriaOnStorage = this.retrieve("selectedCriteriaSize"),
      filterSizeByCriteria = Array.from(selectAllSizes)
        .map((item) => item)
        .filter(item => item.innerHTML === catchSizeCriteriaOnStorage);
    
    filterSizeByCriteria.map((item) => {    
      item.classList.add("sizeChecked");
    });

    const
      selectPrices = this.selectAllHTMLItems(".price"),
      catchPriceCriteriaOnStorage = this.retrieve("selectedCriteriaPrice"),
      filterPriceByCriteria = Array.from(selectPrices)
        .map((item) => item)
        .filter(item => item.value === catchPriceCriteriaOnStorage);
      
      filterPriceByCriteria.map((item) => {    
        item.classList.add("priceChecked");
    })
  }

  applyFilterMenuMobile(): void {
    const applyBtn = this.selectHTMLItem(".btn-apply") as HTMLInputElement;
    applyBtn.addEventListener("click", () => {
      this.reloadPage();
    })
  }

  clearFilterMenuMobile(): void {
    const applyBtn = this.selectHTMLItem(".btn-apply") as HTMLInputElement;
    applyBtn.addEventListener("click", () => {
      this.remove("selectedSize");
      this.remove("selectedPrice");
      this.remove("selectedProduct");
      this.remove("SelectColor");
    })
  }
}

const shopping = new Shopping();
shopping.filterBySize();
shopping.filterByPrice();
shopping.sortBy();
shopping.handleClickBrandAndResetStorage();
shopping.showMore();
shopping.itemCountCart();
shopping.initializeMenuMobile();
shopping.applyFilterMenuMobile();
shopping.multipleCriteria();

document.addEventListener("DOMContentLoaded", initialize.productsList());
