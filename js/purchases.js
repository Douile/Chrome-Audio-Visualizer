// purchases.js

var Page = {
  initialized: false,
  init: function() {
    this.notifications = document.getElementById("notifications");
    this.body = document.getElementById("objects");
    this.root = document.getElementById("wrapper");
    this.sidebar = document.getElementById("contents");
  },
  addProduct: function(product) {
    return this.addItem(product.sku,product.localeData[0].title,product.localeData[0].description,product.prices[0].valueMicros/1000000,product.prices[0].currencyCode);
  },
  addItem: function(id,name,description,price,priceformat) {
    var product = document.createElement("div");
    product.setAttribute("class","product");
    product.setAttribute("item-id",id);
    product.addEventListener("click",function(e) {
      var id = e.target.getAttribute("item-id");
      google.payments.inapp.buy({
        'parameters': {'env': 'prod'},
        'sku': id,
        'success': onPurchase,
        'failure': onPurchaseError
      });
    }, {capture:true,passive:true},true);
    product.name = document.createElement("span");
    product.name.setAttribute("class","product-name");
    product.name.innerText = name;
    product.name.setAttribute("item-id",id);
    product.appendChild(product.name);
    product.description = document.createElement("span");
    product.description.setAttribute("class","product-description");
    product.description.innerText = description;
    product.description.setAttribute("item-id",id);
    product.appendChild(product.description);
    product.price = document.createElement("span");
    product.price.setAttribute("class","product-price");
    product.price.innerText = price+" "+priceformat;
    product.price.setAttribute("item-id",id);
    product.appendChild(product.price);
    this.body.appendChild(product);
    return product;
  },
  displayError: function(errorText) {
    return this.notification(errorText,"error");
  },
  notification: function(text,type) {
    var notification = document.createElement("div");
    notification.setAttribute("class","notification");
    notification.setAttribute("type",type);
    notification.text = document.createElement("span");
    notification.text.innerText = text;
    notification.appendChild(notification.text);
    notification.close = document.createElement("img");
    notification.close.src = "/img/close.svg";
    notification.close.addEventListener("click",function(e) {
      e.target.parentNode.remove();
    })
    notification.appendChild(notification.close);
    this.notifications.appendChild(notification);
    this.notifications.scrollTop = this.notifications.scrollHeight;
    return notification;
  }
}
function onSkuDetails(response) {
  var products = response.response.details.inAppProducts;
  var count = products.length;
  for (var i=0;i<count;i++) {
    Page.addProduct(products[i]);
  }
}
function onSkuError(response) {
  var error = response.response.errorType;
  console.error("Sku error",error);
  switch(error) {
    case "INVALID_RESPONSE_ERROR":
      Page.displayError("Unable to fetch purchases.");
      break;
    default:
      Page.displayError(error);
      break;
  }
}
function onPurchase(response) {
    Page.notification("Purchase success, thank you!","success");
}
function onPurchaseError(response) {
  var error = response.response.errorType;
  console.error("Purchase error",error);
  switch(error) {
    case "PURCHASE_CANCELED":
      Page.displayError("You canceled the purchase.");
      break;
    default:
      Page.displayError(error);
      break;
  }
}


Page.init();
google.payments.inapp.getSkuDetails({
  'parameters': {'env':'prod'},
  'success': onSkuDetails,
  'failure': onSkuError
})
