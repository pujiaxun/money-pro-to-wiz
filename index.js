/**
 * Read CSV srouce file, and format it into an array of objects
 */
const readOriginFile = async () => {
  const originCsvFile = './input/index.csv'
  const { MONEY_PRO_FIELDS } = require("./constants")

  const csv = require('csvtojson')
  const bills = await csv().fromFile(originCsvFile);

  const headerMap = {}
  Object.keys(MONEY_PRO_FIELDS).forEach(name => {
    const vals = MONEY_PRO_FIELDS[name]
    vals.forEach(title => {
      headerMap[title] = name
    });
  });

  const formattedBills = bills.map(bill => {
    const newBill = {}
    Object.keys(bill).forEach(originBillKey => {
      const loweKey = originBillKey.toLowerCase()
      const newBillKey = headerMap[loweKey]
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
const transformAgentToTag = (bill) => {
  const { tags, agent } = bill
  const tagList = tags ? tags.split(';') : []

  if (agent) {
    tagList.push(agent)
  }

  return {
    ...bill,
    tags: tagList.join(';'),
  }
}

const parseAmount = originAmount => {
  // * SAMPLE: "¥2,345.23" OR "(¥2,345.23)"
  const re = /^(\()?(\D?)([,\d.]+)\)?$/;
  const result = re.exec(originAmount);

  if (result === null) return {};

  const amount = parseFloat(result[3].replace(/,/g, ""));
  return {
    num: result[1] ? -amount : amount,
    currency: result[2],
  };
};

// TODO: 多货币问题；导入貌似不支持货币
const formatCurrency = (bill) => {
  const { amount, recieved } = bill
  const newAmount = parseAmount(amount)
  const newRecieved = parseAmount(recieved)

  return {
    ...bill,
    recieved: newRecieved.num,
    amount: newAmount.num,
    currency: newAmount.currency
  }
}

const formatTransType = bill => {
  const { MONEY_PRO_TRANSACTION_TYPES } = require('./constants')
  const { transactionType = '' } = bill
  const lowerTypeName = transactionType.toLowerCase()
  const typesMap = {}
  Object.keys(MONEY_PRO_TRANSACTION_TYPES).forEach(key => {
    const moneyProTypes = MONEY_PRO_TRANSACTION_TYPES[key]
    moneyProTypes.forEach(type => {
      typesMap[type] = key
    })
  })

  if (!typesMap[lowerTypeName]) {
    console.log(transactionType);
  }

  const newType = typesMap[lowerTypeName] || transactionType
  return {
    ...bill,
    transactionType: newType
  }
}

// 分离期初结余和其他交易类型项目
// 转账记录 判断金额差，记录为手续费
// * 负债类型很难搞，并没有体现在CSV中
const reduceTransactionType = (accumulator, currentBill, currentIndex, array) => {
  const { transactionType } = currentBill

  const bills = []
  if (transactionType === 'openingBalance') {
    // 期初余额不能识别，只能手动先添加
    const { account, amount, currency } = currentBill
    // bills.push({
    //   name: account,
    //   initBalance: amount,
    //   account: currency
    // })
    console.log(currentBill);
  } else if (transactionType === 'expense') {
    const { amount } = currentBill
    bills.push({
      ...currentBill,
      amount: -amount
    })
  } else if (transactionType === 'transfer') {
    const { amount, recieved, accountTo, date, time } = currentBill
    bills.push({
      ...currentBill,
      transfers: accountTo,
      amount: -recieved
    })

    if (amount !== recieved) {
      bills.push({
        account: currentBill.account,
        amount: (recieved - amount).toFixed(2),
        category: '其他',
        description: "转账手续费",
        date,
        time
      })
    }
  } else if (transactionType === 'balanceAjustement') {
    bills.push(currentBill)
  } else if (transactionType === 'buyAssets') {
    const { amount } = currentBill
    bills.push({
      ...currentBill,
      amount: -amount
    })
  } else if (transactionType === 'sellAsssts') {
    bills.push(currentBill)
  } else {
    bills.push(currentBill)
  }

  return [
    ...accumulator,
    ...bills
  ]
}

/**
 * Filter necessary fields
 * @param {object} bill
 */
const filterFields = (bill) => {
  const newBill = {}
  const { MONEY_WIZ_FIELDS } = require("./constants")

  Object.keys(MONEY_WIZ_FIELDS).forEach(key => {
    const newKey = MONEY_WIZ_FIELDS[key]
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
    .map(transformAgentToTag)
    .map(formatCurrency)
    .map(formatTransType)
    .reduce(reduceTransactionType, [])
    .map(filterFields)

  await writeIntoFile(formatted)
}

transform()
