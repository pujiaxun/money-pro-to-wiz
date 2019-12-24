const MONEY_PRO_FIELDS = {
  date: ['日期', 'date'],
  amount: ['款额', 'amount'],
  account: ['账户', 'account'],
  recieved: ['总额', 'amount received'],
  accountTo: ['转账到', 'account (to)'],
  balance: ['结余', "balance"],
  category: ['类别', 'category'],
  description: ['说明', 'description'],
  transactionType: ['交易类型', 'transaction type'],
  agent: ['代理人', 'agent'],
  checkNo: ['支票号', 'Check #'],
  klass: ['种类', 'Class']
}

const MONEY_PRO_TRANSACTION_TYPES = {
  expense: ['支出','expense'],
  income: ['收入','income'],
  transfer: ['转账','money transfer'],
  openingBalance: ['期初结余','opening balance'],
  balanceAjustement: ['结余调整','balance adjustment'],
  buyAssets: ['资产买入'],
  sellAsssts: ['资产卖出']
}

const MONEY_WIZ_FIELDS = {
  name: "Name",
  initBalance: "Current balance",
  account: "Account",
  transfers: "Transfers",
  description: "Description",
  payee: "Payee",
  category: "Category",
  date: "Date",
  time: "Time",
  description: "Memo",
  tags: "Tags",
  amount: "Amount",
  currency: "Currency",
  checkNo: "Check #"
}


module.exports = {
  MONEY_PRO_FIELDS,
  MONEY_PRO_TRANSACTION_TYPES,
  MONEY_WIZ_FIELDS
}
