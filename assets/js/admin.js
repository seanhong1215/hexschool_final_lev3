function init(){
  getOrderList();
}
init();

let orderData = [];
const orderList = document.querySelector('.js-orderList');

// c3.js
function renderC3() {
  // 轉物件格式
  let total = {};
  orderData.forEach((item) =>{
    item.products.forEach((productItem) =>{
      //total[productItem.category]
      if(total[productItem.title] == undefined){
        total[productItem.title] = productItem.price * productItem.quantity;
      }else {
        total[productItem.title] += productItem.price * productItem.quantity;
      }
    })
  })

  // 做資料關聯
  let categoryAry = Object.keys(total)
  let newData = [];
  categoryAry.forEach((item)=>{
    let ary = [];
    ary.push(item)
    ary.push(total[item])
    newData.push(ary)
    // console.log(categoryAry)
  })
  newData.sort( (a, b) =>{
    return b[1] - a[1];
  })
  if(newData.length > 3){
    let otherTotal = 0;
    newData.forEach(index=>{
      if(index > 2){
        otherTotal += newData[index][1];
      }
    })
    newData.splice(3, newData.length - 1);
    newData.push(['其他', otherTotal]);
  }

  c3.generate({
    bindto: "#chart",
    data: {
      columns: newData,
      type: "pie",
    },
    color: {
      pattern : ["#301E5F", "#5434A7", "#9D7FEA", "#DACBFF"]
    }
  });
}

// 取得訂單列表
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      orderData = response.data.orders;
     
      let str = "";
      orderData.forEach((item) => {
      // 組產品字串
        let productStr = "";
        item.products.forEach(productItem =>{
          productStr += `<p>${productItem.title} X ${productItem.quantity}</p>`
      })
      // 判斷訂單處理狀態
      let orderStatus = "";
      if(item.paid == true){
        orderStatus = "已處理"
      }else{
        orderStatus = "未處理"
      }
      // 處理時間格式 時間搓要 13碼
      const timeStamp = new Date(item.createdAt * 1000)
      const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`

      // 組訂單字串
        str += `
          <tr>
            <td>${item.id}</td>
            <td>
              <p>${item.user.name}</p>
              <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
              ${productStr}
            </td>
            <td>${orderTime}</td>
            <td class="orderStatus">
              <a href="#" class="js-orderStatus" data-id=${item.id}>${orderStatus}</a>
            </td>
            <td>
              <input type="button" class="delSingleOrder-Btn js-orderDelete" data-status=${item.paid} data-id=${item.id} value="刪除">
            </td>
          </tr>
        `
      });
      orderList.innerHTML = str;
      renderC3();
    })
    
}

orderList.addEventListener('click', function(e){
  e.preventDefault();
  const targetClass = e.target.getAttribute("class");
  let id = e.target.getAttribute("data-id");
  if(targetClass == "js-orderStatus"){
    let status = e.target.getAttribute("data-status");
    editOrderList(id, status)
    return;
  }else if(targetClass === "delSingleOrder-Btn js-orderDelete"){
    deleteOrderItem(id)
    return;
  }
})


// 修改訂單狀態
function editOrderList(orderId, status) {
  let newStatus;
  if(status == true){
    newStatus = false;
  }else{
    newStatus = true;
  }
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": newStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      // console.log(response.data);
      swal({
        title: "修改訂單狀態成功",
        icon: "success",
        buttons: "OK",
      });
      getOrderList();
    })
}


// 刪除特定訂單
function deleteOrderItem(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      // console.log(response.data);
      swal({
        title: "刪除成功",
        icon: "success",
        buttons: "OK",
      });
      getOrderList();
    })
}


const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click', function(e){
  // console.log(e.target)
  deleteAllOrder()
})

// 刪除全部訂單
function deleteAllOrder() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      swal({
        title: "刪除全部訂單成功",
        icon: "success",
        buttons: "OK",
      });
      getOrderList();
    })
}


// 登入註冊
const signUpAccount = document.querySelector(".signUpAccount");
const signUpPassword = document.querySelector(".signUpPassword");
const signInAccount = document.querySelector(".signInAccount");
const signInPassword = document.querySelector(".signInPassword");

const login = document.querySelector('.login')
login.addEventListener('click', function(e){
  // console.log(e.target)
  siupIn();
})


const signup = document.querySelector('.signup')
signup.addEventListener('click', function(e){
  // console.log(e.target)
  signUp()
})

function signUp(){
  if (signUpAccount.value == "" || signUpPassword.value==""){
    swal({
      title: "請填寫正確資訊",
      icon: "warning",
      buttons: "OK",
    });
    return;
  }
  let obj = {};
  obj.email = signUpAccount.value;
  obj.password = signUpPassword.value;
  axios.post('https://hexschool-tutorial.herokuapp.com/api/signup', obj)
    .then(function (response) {
      if (response.data.message=="帳號註冊成功"){
        swal({
          title: "恭喜帳號註冊成功",
          icon: "success",
          buttons: "OK",
        });
        window.location.replace('/admin.html');
      }else{
        swal({
          title: "帳號註冊失敗，有可能有人用你的email註冊！",
          icon: "error",
          buttons: "OK",
          dangerMode: true,
        });
      }
      account.value = "";
      password.value="";
    })
    .catch(function (error) {
      console.log(error);
    });
}
function siupIn() {
  if (signInAccount.value === "" || signInPassword.value === "") {
    swal({
      title: "請填寫正確資訊",
      icon: "warning",
      buttons: "OK",
    });
    return;
  }
  let obj = {};
  obj.email = signInAccount.value;
  obj.password = signInPassword.value;
  axios
    .post("https://hexschool-tutorial.herokuapp.com/api/signin", obj)
    .then(function (res) {
      if (res.data.success == true) {
        swal({
          title: "恭喜帳號登入成功",
          icon: "success",
          buttons: "OK",
        });
        window.location.replace('/admin.html');
      } 
      signInAccount.value = "";
      signInPassword.value = "";
    })
    .catch(function (error) {
      swal({
        title: "此帳號不存在或帳號密碼錯誤",
        icon: "error",
        buttons: "OK",
        dangerMode: true,
      });
    });
}

