# Money Pro to Wiz
Migrate CSV datas from Money Pro to MoneyWiz3.

## Usage

1. Export bills as a CSV file from Money Pro.
1. Put the CSV file into `input` directory
1. Run `node index.js`(For the first time, you need to run `npm install`)
1. Harvest the `output/index.csv`
1. Import the output CSV file into your MoneyWiz3 application, and adjust the `account` field.

## Tips

This tool may be helpful to Chinese users, but not all users. Feel free to submit PRs or fork if you want to improve it.
