/**
 * Read CSV srouce file, and format it into an array of objects
 */
const readOriginFile = async () => {
  const originCsvFile = './input/index.csv'
  const csv = require('csvtojson')
  const bills = await csv().fromFile(originCsvFile);
  const headerNames = {
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

  const headerMap = {}
  Object.keys(headerNames).forEach(name => {
    const vals = headerNames[name]
    vals.forEach(title => {
      headerMap[title] = name
    });
  });

  const formattedBills = bills.map(bill => {
    const newBill = {}
    Object.keys(bill).forEach(originBillKey => {
      const newBillKey = headerMap[originBillKey]
      if (newBillKey) {
        newBill[newBillKey] = bill[originBillKey]
      }
    })
    return newBill
  })

  return formattedBills
}

/**
 * Format Date and Time
 * @param {object} bill
 */
const formatDateAndTime = (bill = {}) => {
  const format = require('date-fns/format')
  const originDateStr = bill.date || ''
  const formattedDateStr = originDateStr
    .replace("at", " ")
    .replace("年", "/")
    .replace("月", "/")
    .replace("日", "");
  const originDate = new Date(formattedDateStr);
  const newDate = format(originDate, 'yyyy-MM-dd')
  const newTime = format(originDate, 'HH:mm')
  return {
    ...bill,
    date: newDate,
    time: newTime
  }
}

/**
 * Format bills' categories and subcategories
 * @param {object} bill
 */
const formatCategory = (bill = {}) => {
  const { category: originCate } = bill
  const newCate = originCate.replace(": ", ' > ')

  return {
    ...bill,
    category: newCate
  }
}

// TODO: 代理人转成标签or交易对象 （提供选项）

// TODO: 多货币问题

// TODO：分离期初结余和其他交易类型项目
// TODO: 转账分为两笔账单

/**
 * Filter necessary fields
 * @param {object} bill
 */
const filterFields = (bill) => {
  const necessaryFields = {
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

  const newBill = {}

  Object.keys(necessaryFields).forEach(key => {
    const newKey = necessaryFields[key]
    newBill[newKey] = bill[key] || ''
  })

  return newBill
}

/**
 * Write into a CSV file
 * @param {object} bills
 */
const writeIntoFile = async (bills) => {
  if (!bills.length) return
  const [sampleBill] = bills

  const { parse } = require('json2csv');
  const fs = require('fs');

  const fields = Object.keys(sampleBill)
  const opts = { fields };

  const csv = parse(bills, opts);
  const targetCsvFile = './output/index.csv'
  await fs.writeFileSync(targetCsvFile, csv)
}

const transform = async () => {
  const originBills = await readOriginFile()
  const formatted = originBills
    .map(formatDateAndTime)
    .map(formatCategory)
    .map(filterFields)

  await writeIntoFile(formatted)
}

transform()
