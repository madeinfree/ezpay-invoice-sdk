require('dotenv').config()
const EzpayInvoice  = require('../build/ezpay-invoice').default

const {
  MERCHANT_ID,
  HASH_KEY,
  HASH_IV
} = process.env

const ei = new EzpayInvoice()
ei.setMerchantID(MERCHANT_ID)
ei.setHashKeyAndIV({
  key: HASH_KEY,
  iv: HASH_IV
})
ei.setPostData({
  MerchantOrderNo: '201409170000001',
  Status: '1',
  BuyerName: '王大品',
  BuyerUBN: '20312900',
  Amt: '490',
  ItemName: '商品一',
  ItemCount: '1',
  ItemUnit: '個',
  ItemPrice: '490',
  ItemAmt: '490'
})
ei.issueInvoice()
  .then(r => {
    console.log(r)
  }).catch(err => {
    console.log(err)
  })