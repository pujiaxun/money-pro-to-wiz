// 读取源CSV文件，格式化为标准obj数组
const originCsvFile = './input/index.csv'
const csv = require('csvtojson')
const readOriginFile = async () => {
  const bills = await csv().fromFile(originCsvFile);
  const headerNames = {
    date: ['日期', 'date'],
    amount: ['款额', 'amount'],
    account: ['账户', 'account'],
    recieved: ['总额', 'amount received'],
    accountTo: ['转账到', 'account (to)'],
    balance: ['结余', "balance"],
    category: ['类别', 'category'],
    desc: ['说明', 'description'],
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

// 格式化时间和日期
const format = require('date-fns/format')
const formatDateAndTime = (bill = {}) => {
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

// 分类和子分类名称格式化
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

// TODO: 转账分为两笔账单

// TODO：分离期初结余和其他交易类型项目

// TODO: 写入文件

const transform = async () => {
  const originBills = await readOriginFile()
  const formatted = originBills
    .map(formatDateAndTime)
    .map(formatCategory)
  console.log(formatted.slice(0, 10));
}

transform()
