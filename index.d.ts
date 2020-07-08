export type Data = {
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

interface HashKeyIV {
  key: string
  iv: string
}

export default class EzpayInvoice {
  setMerchantID(id: string): void;
  setHashKeyAndIV(hashKeyIV: HashKeyIV): void;
  setPostData(data: Data): void;
  setMode(mode: 'dev' | 'prod'): void;
  issueInvoice(): Promise<{
    status: string
    message: string
    result: any
  }>

  get getMerchantID(): string
}