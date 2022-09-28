const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';


class List {
    /**
     *
     * @param url - путь к json файлу, из которого будем брать товары
     * @param container - в данный блок выведем товары либо каталога, либо корзины
     * @param list - для возможности вывода и товаров каталога, и товаров корзины
     */
    constructor(url, container, list = list2) {
        this.container = container;
        this.list = list;
        this.url = url;
        this.goods = [];//массив товаров из JSON документа
        this.allProducts = [];
        this._init();
    }


    _getJson(url) {

        return fetch(url ? url : `${API + this.url}`)
            .then(result => result.json())
            .catch(error => {
                console.log(error);
            });

    }

    handleData(data) {
        this.goods = data;
        this.render();
    }

    calcSum() {
        return this.allProducts.reduce((accum, item) => accum += item.price, 0);
    }

    render() {
        console.log(this.constructor.name);
        const block = document.querySelector(this.container);
        for (let product of this.goods) {
            const productObj = new this.list[this.constructor.name](product);
            console.log(productObj);
            this.allProducts.push(productObj);
            block.insertAdjacentHTML('beforeend', productObj.render());
        }
    }
}

class Item {
    constructor(product, img = 'https://via.placeholder.com/200x150') {
        this.product_name = product.product_name;
        this.price = product.price;
        this.id_product = product.id_product;
        this.img = img;
    }

    render() {
        return `<div class="product-item" data-id="${this.id}">
                <img src="${this.img}" alt="Some img">
                <div class="desc">
                    <h3>${this.product_name}</h3>
                    <p>${this.price} $</p>
                    <button class="buy-btn"
                    data-id="${this.id_product}"
                    data-name="${this.product_name}"
                    data-price="${this.price}">Купить</button>
                </div>
            </div>`
    }
}

//Каталог товаров
class ProductsList extends List {
    constructor(cart, container = '.products', url = "/catalogData.json") {
        super(url, container) //вызываем конструктор базового класса
        this.cart = cart;
        this._getJson()
            .then(data => //data - объект js
                this.handleData(data));
    }

    _init() {
        document.querySelector(this.container).addEventListener('click', e => {
            if (e.target.classList.contains('buy-btn')) {
                this.cart.addProduct(e.target);
            }
        });
    }
}

//Товар католога


class ProductItem extends Item {}

class Cart extends List {
    constructor(container = '.cart-block', url = "/getBasket.json") {
        super(url, container);
        this._getJson()
            .then(data => { //data - объект js
                this.handleData(data.contents);
            });
    }

    addProduct(element) {
        this._getJson()
            .then(data => {
                if (data.result === 1) {
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product.id_product === productId);
                    if (find) {
                        find.quantity++;
                        this._updateCart(find);
                    } else {
                        let product = {
                            id_product: productId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            quantity: 1
                        };
                        this.goods = [product];
                        this.render();
                    }
                } else {
                    alert('Доступ запрещен');
                }
            });
    }
    removeProduct(element){
        this._getJson(`${API}/deleteFromBasket.json`)
            .then(data => {
                if(data.result === 1){
                    let productId = +element.dataset['id'];
                    let find = this.allProducts.find(product => product.id_product ===productId)
                    if(find.quantity > 1){
                        find.quantity--;
                        this._updateCart(find);
                    } else {
                        this.allProducts.splice(this.allProducts.indexOf(find), 1);
                        document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
                    }
                } else {
                    alert('Error');
                }
            })
    }

    _updateCart(product){
        let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
        block.querySelector('product-quantity').textContent = `Quantity: ${product.quantity}`;
        block.querySelector('product-price').textContent = `${product.quantity*product.price}`;
    }
    _init(){
        a
        document.querySelector(this.container).addEventListener('click', e =>{
            if(e.target.classList.contains('del-btn')) {
                this.removeProduct(e.target);
            }
        })
    }

}

class CartItem extends Item {
    constructor(product, img = 'https://via.placeholder.com/200x150') {
        super(product, img);
        this.quantity = product.quantity;

    }

    render() {
        return `<div class="cart-item" data-id="${this.id_product}">
                <div class="product-bio">
                <img src="${this.img}" alt="Some img">
                <div class="product-desc">
                    <p class="product-title">${this.product_name}</p>
                    <p class="product-single-price">$${this.price} $</p>
                    <p class="product-quantity">Количество: ${this.quantity}</p>  
                   </div>
                   <div class="rigth-block">
                   <p class="product-price">$${this.quantity*this.price}</p>
                    <button class="del-btn" data-id="$this.id_product">x</button>
                </div>
                </div>
            </div>`
    }
}

const list2 = {
    ProductsList: ProductItem,
    Cart: CartItem
};

// list2[ProductList];

let cart = new Cart();
let products = new ProductsList(cart);