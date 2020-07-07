import crypto = require("crypto");
import axios from 'axios'
import FormData from 'form-data'

import {
  DEVELOPMENT_ENDPOINT,
  PRODUCTION_ENDPOINT
} from './Constants'

type Data = {
  /** Default "JSON" */
  ResponseType: 'JSON' | 'String'
  TimeStamp: string
  MerchantOrderNo: string
  Status: '0' | '1' | '3'
  Category: 'B2B' | 'B2C'
  BuyerName: string
  BuyerUBN: string
  BuyerEmail: string
  PrintFlag: 'Y' | 'N'
  TaxType: '1' | '2' | '3' | '9'
  TaxRate: number
  Amt: number
  TaxAmt: number
  TotalAmt: number
  ItemName: string
  ItemCount: string
  ItemUnit: string
  ItemPrice: string
  ItemAmt: string
  Comment: string
}

class EzpayInvoice {
  /** 商家代號 */
  private MerchantID: string
  /** 加密鑰匙 */
  private HashKey: string
  /** 加密 IV */
  private HashIV: string
  private PostData: {
    /** 回應格式 */
    RespondType: 'JSON' | 'String'
    /** 串接程式版本 */
    Version: '1.4'
    /** 時間戳記 */
    TimeStamp: string
    /** 自訂編號 */
    MerchantOrderNo: string
    /**
     * 開立發票方式
     * @param 0 等待觸發開立
     * @param 1 即時開立
     * @param 3 預約自動開立
     * */
    Status: '0' | '1' | '3'
    /**
     * 發票種類
     * @param B2B 買受人為營業人
     * @param B2C 買受人為個人
     * */
    Category: 'B2B' | 'B2C'
    /** 買受人名稱 */
    BuyerName: string
    /** 買受人統一編號 */
    BuyerUBN: string
    /** 買受人電子信箱 */
    BuyerEmail: string
    /** 索取紙本發票 */
    PrintFlag: 'Y' | 'N'
    /**
     * 課稅別
     * @param 1 應稅
     * @param 2 零稅率
     * @param 3 免稅
     * @param 9 混合應稅與免稅或零稅率
     * */
    TaxType: '1' | '2' | '3' | '9'
    /** 稅率 */
    TaxRate: number
    /** 銷售額合計 */
    Amt: number
    /** 稅額 */
    TaxAmt: number
    /** 發票金額（銷售額 + 稅額） */
    TotalAmt: number
    /** 商品名稱 */
    ItemName: string
    /** 商品數量 */
    ItemCount: string
    /** 商品單位 */
    ItemUnit: string
    /** 商品單價 */
    ItemPrice: string
    /** 商品小計 */
    ItemAmt: string
    /** 備註 */
    Comment: string
  }

  private mode: 'dev' | 'prod'

  constructor() {
    this.PostData = {
      RespondType: 'JSON',
      Version: '1.4',
      TimeStamp: '',
      MerchantOrderNo: '',
      Status: '1',
      Category: 'B2B',
      BuyerName: '',
      BuyerUBN: '',
      BuyerEmail: '',
      PrintFlag: 'Y',
      TaxType: '1',
      TaxRate: 5,
      Amt: 0,
      TaxAmt: 0,
      TotalAmt: 0,
      ItemName: '',
      ItemCount: '0',
      ItemUnit: '',
      ItemPrice: '0',
      ItemAmt: '0',
      Comment: ''
    }

    this.mode = 'dev'
  }

  public setMerchantID(id: string) {
    this.MerchantID = id
  }

  public setHashKeyAndIV({
    key, iv
  }: {
    key: string
    iv: string
  }) {
    this.HashKey = key
    this.HashIV = iv
  }

  public setPostData(postData: Data) {
    this.checkPostData(postData)

    this.PostData.RespondType = postData.ResponseType ?? 'JSON'
    this.PostData.TimeStamp = postData.TimeStamp ?? String(Math.round(new Date().getTime() / 1000))
    this.PostData.MerchantOrderNo = postData.MerchantOrderNo
    this.PostData.Status = postData.Status ?? '1'
    this.PostData.Category = postData.Category ?? 'B2B'
    this.PostData.BuyerName = postData.BuyerName
    this.PostData.BuyerUBN = postData.BuyerUBN
    this.PostData.BuyerEmail = postData.BuyerEmail
    this.PostData.PrintFlag = postData.PrintFlag ?? 'Y'
    this.PostData.TaxType = postData.TaxType ?? '1'
    this.PostData.TaxRate = postData.TaxRate ?? 5
    this.PostData.Amt = postData.Amt
    this.PostData.TaxAmt = postData.TaxAmt ?? Math.round(postData.Amt * 0.05)
    this.PostData.TotalAmt = postData.TotalAmt ?? Math.round(postData.Amt * 1.05)
    this.PostData.ItemName = postData.ItemName
    this.PostData.ItemCount = postData.ItemCount
    this.PostData.ItemUnit = postData.ItemUnit
    this.PostData.ItemPrice = postData.ItemPrice
    this.PostData.ItemAmt = postData.ItemAmt
    this.PostData.Comment = postData.Comment
  }

  private checkPostData(postData: Data) {
    if (!this.MerchantID) {
      this.referenceError('MerchantID')
    }
    if (!this.HashKey) {
      this.referenceError('HashKey')
    }
    if (!this.HashIV) {
      this.referenceError('HashIV')
    }
    if (!postData.MerchantOrderNo) {
      this.referenceError('MerchantOrderNo')
    }
    if (!postData.BuyerName) {
      this.referenceError('BuyerName')
    }
    if (!postData.Amt) {
      this.referenceError('Amt')
    }
    if (!postData.ItemName) {
      this.referenceError('ItemName')
    }
    if (!postData.ItemCount) {
      this.referenceError('ItemCount')
    }
    if (!postData.ItemUnit) {
      this.referenceError('ItemUnit')
    }
    if (!postData.ItemPrice) {
      this.referenceError('ItemPrice')
    }
    if (!postData.ItemAmt) {
      this.referenceError('ItemAmt')
    }
  }

  private referenceError(field: string) {
    throw new ReferenceError(`${field} 不可為空`)
  }

  public async issueInvoice(): Promise<{
    status: string
    message: string
    result: any
  }> {
    const endPoint = this.mode === 'prod' ? PRODUCTION_ENDPOINT : DEVELOPMENT_ENDPOINT
    const postDataQueryString = this.getQueryString()
    const encrypted = this.encodeAES(postDataQueryString)

    const formData = new FormData();
    formData.append("MerchantID_", this.MerchantID);
    formData.append("PostData_", encrypted);

    const result = await axios({
      method: 'POST',
      url: endPoint,
      data: formData,
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
      }
    })

    const { Status, Message, Result } = result.data
    return {
      status: Status,
      message: Message,
      result: Result
    }
  }

  private getQueryString(): string {
    const postData: {
      [key: string]: any
    } = this.PostData
    return Object.keys(postData).reduce((pre, key, index) => {
      if (index === Object.keys(postData).length - 1) {
        return pre + key + "=" + postData[key];
      }
      return pre + key + "=" + postData[key] + "&";
    }, "").replace(/undefined/g, '');
  }

  private encodeAES(queryString: string): string {
    let cipher = crypto.createCipheriv("aes-256-cbc", this.HashKey, this.HashIV);
    cipher.setAutoPadding(true);
    let encrypted = cipher.update(encodeURI(queryString), "binary", "hex");
    encrypted += cipher.final("hex");
    return encrypted
  }

  public setMode(mode: 'prod' | 'dev') {
    this.mode = mode
  }

  get getMerchantID() {
    return this.MerchantID
  }
}

export default EzpayInvoice