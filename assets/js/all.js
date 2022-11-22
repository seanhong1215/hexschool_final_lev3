

const productList = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');

let productData = []
let shoppingCartData = []

//初始化
function init() {
  getProductList();
  getCartList()
}
init();

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      // console.log(response.data);
      productData = response.data.products;
      renderProduct();
    })
    .catch(function(error){
      // console.log(error.response.data)
      swal({
        title: "取得資料失敗",
        icon: "error",
        buttons: "OK",
        dangerMode: true,
      });
    })
}

// 顯示畫面
function renderProduct() {
  let str = "";
  productData.forEach((item)=>{
    str += combineProductString(item)
  })
  productList.innerHTML = str
}

// 組字串
function combineProductString(item) {
  return (`
    <li class="card col-3 products-list">
    <span class="tag">新品</span>
    <div class="card-media">
      <img src="${item.images}" alt="">
      <a href="#" id="addCartBtn" class="card-link" data-id="${item.id}">加入購物車</a>
    </div>
    <div class="card-body">
      <h5 class="card-title">${item.title}</h5>
      <p class="card-price"><del>NT$${toThousandths(item.origin_price)}</del></p>
      <p class="card-price"><ins>NT$${toThousandths(item.price)}</ins></p>
    </div>
  </li>
  `);
}

// 篩選資料
productSelect.addEventListener('change', function(e){
  // console.log(e.target.value)
  const category = e.target.value;
  if(category === "全部"){
    renderProduct();
    return;
  }
  let str = "";
  productData.forEach((item)=>{
    if(item.category === category){
      str += combineProductString(item);
    }
  })
  productList.innerHTML = str;
})

// 加入購物車
// 監聽都寫在外層
productList.addEventListener('click', function(e){
  e.preventDefault();
  let addCartClass = e.target.getAttribute('class')
  if(addCartClass !== "card-link"){
    return;
  }
  let productId = e.target.getAttribute('data-id')
  let numCheck = 1;
  shoppingCartData.forEach((item)=>{
    if(item.product.id === productId){
      numCheck = item.quantity += 1;
    }
  })
  addCartItem(productId, numCheck) 
  // console.log(numCheck)
})

// 加入購物車
function addCartItem(productId, numCheck) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": productId,
      "quantity": numCheck
    }
  }).
    then(function (response) {
      swal({
        title: "成功加入購物車",
        icon: "success",
        buttons: "OK",
      });
      getCartList();
    })

}


// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      shoppingCartData = response.data.carts;
      // console.log(response.data);
      document.querySelector('.js-total').textContent = toThousandths(response.data.finalTotal);
      let str = "";
      shoppingCartData.forEach((item)=>{
        str += `
            <tr>
            <td>
              <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${item.product.title}</p>
              </div>
            </td>
            <td>NT$${toThousandths(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousandths(item.product.price * item.quantity)}</td>
            <td class="discardBtn">
              <a href="#" class="material-icons" data-id="${item.id}" data-product="${item.product.title}">
                clear
              </a>
            </td>
          </tr>
        `
      })
      cartList.innerHTML = str;
    })
}

const cartList = document.querySelector('.shoppingCart-tableList');
cartList.addEventListener('click', function(e){
  // console.log(e.target)
  e.preventDefault();
  const cardId = e.target.getAttribute('data-id')
  const cardProduct = e.target.getAttribute('data-product')
  // console.log(deleteId)
  if(cardId == null){
    swal({
      title: "你點到其他東西了~",
      icon: "info",
      buttons: "OK",
    });
    return;
  }
  deleteCartItem(cardId, cardProduct)
})

// 刪除購物車內特定產品
function deleteCartItem(cartId, cardProduct) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      swal({
        title: `刪除${cardProduct}產品成功`,
        icon: "success",
        buttons: "OK",
      });
      getCartList();
      // console.log(cartId);
    })
}

const discardAllBtn = document.querySelector('.discardAllBtn')
discardAllBtn.addEventListener('click', function(e){
  e.preventDefault();
  deleteAllCartList()
})
// 清除購物車內全部產品
function deleteAllCartList() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      // console.log(response.data);
      swal({
        title: "刪除全部購物車成功",
        icon: "success",
        buttons: "OK",
      });
      getCartList();
    })
    .catch((err)=>{
      swal({
        title: "購物車已經清空，請勿重複點擊",
        icon: "warning",
        buttons: "OK",
      });
    })
}

const orderInfoBtn = document.querySelector('.orderInfo-btn')
orderInfoBtn.addEventListener('click', function(e){
  e.preventDefault();
  if(shoppingCartData.length === 0){
    swal({
      title: "請加入購物車",
      icon: "warning",
      buttons: "OK",
    });
    return;
  }
  const customerName = document.querySelector('#customerName').value
  const customerPhone = document.querySelector('#customerPhone').value
  const customerEmail = document.querySelector('#customerEmail').value
  const customerAddress = document.querySelector('#customerAddress').value
  const tradeWay = document.querySelector('#tradeWay').value

if(customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || tradeWay == ""){

  swal({
    title: "請填寫訂單資訊",
    icon: "warning",
    buttons: "OK",
  });
  return;
}

  const data = {
    name: customerName,
    phone: customerPhone,
    email: customerEmail,
    address: customerAddress,
    trade: tradeWay
  }
  createOrder(data)
})

// 驗證
const form = document.querySelector('.orderInfo-form')
const inputs = document.querySelectorAll('input[type=text],input[type=tel],input[type=email]')
const constraints = {
  name: {
    presence: {
      message: "姓名 必填欄位"
    }
  },
  phone: {
    presence: {
      message: "電話 需要超過8碼"
    }
  },
  email: {
    presence: {
      message: "信箱 必填欄位"
    }
  },
  address: {
    presence: {
      message: "地址 必填欄位"
    }
  },

};
// console.log(inputs)
inputs.forEach((item)=>{
  // console.log(item)
  item.addEventListener('change', function(){
    item.nextElementSibling.textContent = "";
    let errors = validate(form, constraints) || "";
    // console.log(errors)
    if(errors){
      Object.keys(errors).forEach((keys) => {
        document.querySelector(`.${keys}`).textContent = errors[keys];
        return;
      });    
    }
  })
})


// 送出購買訂單
function createOrder(data) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": data.name,
          "tel": data.phone,
          "email": data.email,
          "address": data.address,
          "payment": data.trade
        }
      }
    }
  ).
    then(function (response) {
      // console.log(response.data);
      swal({
        title: "訂單建立成功",
        icon: "success",
        buttons: "OK",
      });
      form.reset();
      getCartList();
    })
    .catch(function(error){
      // console.log(error.response.data);
      swal({
        title: "訂單建立失敗",
        icon: "error",
        buttons: "OK",
        dangerMode: true,
      });
    })
}

// utils js
function toThousandths(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

// Eamil 驗證


// 電話 驗證
