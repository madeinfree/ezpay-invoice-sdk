<div align="center">
<h1>ezPay Invoice SDK</h1>

<p>Ezpay 發票相關 SDK</p>
</div>

## Installation

```bash
> yarn add ezpay-invoice-sdk -p
```

## Usage

### Create Instance

```js
const EzpayInvoice  = require('ezpay-invoice-sdk').default
const ei = new EzpayInvoice()
```

### Set Mode

#### setMode(mode: string)

設置 Endpoint 呼叫環境

- dev {Default https://cinv.ezpay.com.tw/Api/invoice_issue}
- prod {https://inv.ezpay.com.tw/Api/invoice_issue}

```js
ei.setMode('prod')
```

### Set Merchant ID（required）

#### setMerchantID(MerchantID: string)

設置商店代號（必填）

```js
ei.setMerchantID(process.env.MERCHANT_ID)
```

### Set Hash Key and IV（required）

#### setHashKeyAndIV(data: Object)

| 欄位 | 型別 | 說明 | 預設 | 必填 |
|---|---|---|---|---|
| key | string | 加密時會使用到的 HashKey | null | ✅ |
| iv | string | 加密時會使用到的 HashIV | null | ✅ |

設置加密 HashKey 與 HashIV

```js
ei.setHashKeyAndIV({
  key: process.env.HASH_KEY,
  iv: process.env.HASH_IV
})
```

### Set Post Data

#### setPostData

＊目前僅提供單項商品

| 欄位 | 型別 | 說明 | 預設 | 必填 |
|---|---|---|---|---|
| RespondType | string | 回應格式（JSON, String）| JSON | 否 |
| MerchantOrderNo | string | 自訂編號 | null | ✅ |
| Status | string | 開立發票方式（0 - 等待觸發開立, 1 - 即時開立, 3 - 預約自動開立）| 1 | 否 |
| TimeStamp | string | 時間戳記 | 當下時間（unix time） | 否 |
| Category | string | 發票種類（B2B - 買受人為營業人, B2C - 買受人為個人）| B2B | 否 |
| BuyerName | string | 買受人名稱 | null | ✅ |
| BuyerUBN | string | 買受人統一編號（買受人為營業人時必填）| null | 否 |
| BuyerEmail | string | 買受人電子信箱 | null | 否 |
| PrintFlag | string | 索取紙本發票（Y, N）| Y | 否 |
| TaxType | string | 課稅別（1 - 應稅, 2 - 零稅率, 3 - 免稅, 9 - 混合應稅與免稅或零稅率）| Y | 否 |
| TaxRate | number | 稅率 | 5 | 否 |
| TaxAmt | number | 稅額 | 銷售額合計 * 0.05（四捨五入） | 否 |
| Amt | number | 銷售額合計 | null | ✅ |
| TotalAmt | number | 發票金額（銷售額 + 稅額）| 銷售額合計 * 1.05（四捨五入）| 否 |
| ItemName | string | 商品名稱 | null | ✅ |
| ItemCount | string | 商品數量 | null | ✅ |
| ItemUnit | string | 商品單位 | null | ✅ |
| ItemPrice | string | 商品單價 | null | ✅ |
| ItemAmt | string | 商品小計 | null | ✅ |
| Comment | string | 備註 | null | 否 |

設置發票內容

```js
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
```

### Issue Invoice

#### ei.issueInvoice(): Promise\<T\>

Return Promise
| 欄位 | 型別 | 說明 |
|---|---|---|
| status | string | 開立結果狀態 |
| message | string | 開立結果說明 |
| result | string | 開立結果詳細內容 |

```js
ei.issueInvoice()
  .then(r => {
    console.log(r)
  }).catch(err => {
    console.log(err)
  })
```

## LICENSE

### MIT