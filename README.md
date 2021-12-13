# InvShare
InvShare is the final part of Full Stack open 2021 by the University of Helsinki. The project, which is worth of 5, 7 or 10 credits, should be implemented in React and/or Node. 

## Heroku link
[heroku](https://fso2021practicework.herokuapp.com/)

## Working hours
[working hours](https://github.com/olliglorioso/fso2021-practice-work/blob/master/WORKINGHOURS.md)

## Run locally

In order to start the app in development, run these commands in the root folder...

```npm run install:all```

```npm run run:backend```

```npm run run:frontend```

...and open http://localhost:3000.

## Environment variables / secrets
ALPHAVANTAGE_API_KEY is the key for Alpha Vantage Stock API.\
FINNHUB_API_KEY is the key for Finnhub Stock API.\
HEROKU_API_KEY is the key for Heroku.\
MONGODB_TEST_URI is the endpoint for the test database.\
MONGODB_URI is the endpoint for the database.\
PORT is the port.\
SECRETFORTOKEN is a secret for the encryption of passwords.\
SLACK_WEBHOOK_URL is the url for the Slack-App (pipeline sends a notification to a Slack group when completed).\

## Description of the app
InvShare is a website for sharing your stock portfolio. You can copy your real-life portfolio or just play with imaginary money and try to make as much profit as possible. Currently you can only use the app with the stock symbols of NYSE, such as TSLA, AAPL, NOK, MSFT, AMZN, A, or B. This because the best solutions for Stock APIs did not offer anything better for free and the budget for this project was not too overwhelming. 

## Technologies, (relevant) libraries and services used
The whole app uses TypeScript as its primary programming language, tests are written in JavaScript. The most important technologies in this project were React, TypeScript, Node.js, GraphQL and MongoDB. Since this was still quite small medium-sized software project, cloud-based Github Actions was an obvious choice for CI/CD. 

**Frontend:**
- Visual elements: [material-ui](https://www.npmjs.com/package/@material-ui/core) for design, [react-apexcharts](https://www.npmjs.com/package/react-apexcharts) for charts, [react-confirm-alert](https://www.npmjs.com/package/react-confirm-alert) for notifications, [react-simple-animate](https://www.npmjs.com/package/react-simple-animate) for animations
- Forms: [formik](https://www.npmjs.com/package/formik), [yup](https://www.npmjs.com/package/yup) for validation
- State handling: [redux](https://www.npmjs.com/package/redux)
- Interaction with the backend: [@apollo/client](https://www.npmjs.com/package/@apollo/client), [graphql-tag](https://www.npmjs.com/package/graphql-tag)
- Cyber security: [bcrypt](https://www.npmjs.com/package/bcrypt), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- Testing: [cypress](https://www.npmjs.com/package/cypress), [jest](https://www.npmjs.com/package/jest)

**Backend:**
- Stock APIs: [Finnhub Stock API](https://finnhub.io), [Alpha vantage Stock API](https://www.alphavantage.co)
- MongoDB object modeling: [mongoose](https://www.npmjs.com/package/mongoose), [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator) for validation
- Interaction with the frontend: [apollo-server-express](https://www.npmjs.com/package/apollo-server-express), [express](https://www.npmjs.com/package/express)

## Introduction video to the app
[https://streamable.com/542l7c](https://streamable.com/542l7c)
There is an error in the video, where a date is the format NN:NN:NN. This is because the stocks related to the error were manually added to the backend and the developer made a humane error. There is no problem with the app itself.

## Explanation of code
**ActionsRoute:**\
This page shows the transactions of the users that the logged-in-user has followed, both sales and purchases. It fetches data from the backend by using query getActions:
```typescript
    // GetActions-query returns the actions (at the moment only "stockevents") of the users
    // current user follows. The actions are sorted by date.
    getActions: async (
        _root: undefined,
        _args: void,
        {currentUser}: {currentUser: PopulatedUserType}
    ): Promise<{transaction: TransactionType, transactionOwner: string}[]> => {
        // Creating an array of arrays by mapping through every user that the current user follows and 
        // getting their transactions. We also put transactionOwner in the array to make sure we can
        // get the user that created the transaction.
        const followersTransactions = 
            (currentUser.usersFollowing.map((item: {user: PopulatedUserType, date: string}) => item.user))
            .map((item: PopulatedUserType) => {return {
                transactions: item.usersTransactions, 
                transactionOwner: item.usersUsername}
            })
        // Initializing the final list of transactions and their owners.
        const transactionList: {transaction: TransactionType, transactionOwner: string}[] = []
        // This double-for-loop goes through the above array and puts every transaction
        // in a single list with the owner in the same object.
        for (const item of followersTransactions) {
            for (const o of item.transactions) {
                transactionList.push({transaction: o, transactionOwner: item.transactionOwner})
            }
        }
        // Sorting the list by date.
        const orderedTransactions = transactionList.sort((
            a: {transaction: TransactionType, transactionOwner: string}, 
            b: {transaction: TransactionType, transactionOwner: string}) => {
            return new Date(a.transaction.transactionDate).getTime() - new Date(b.transaction.transactionDate).getTime()
        }).reverse()
        // Returning the sorted list.
        return orderedTransactions
    }
```
GetActions-query gets the transactions of the users that the current user follows from the query's context. Then the query creates an object for every transaction, and the object contains the creator of the transactions as well. Then the list is sorted by date and returned to the frontend, which with the help of TransactionList-component renders the "actions", also known as transactions.

**BuyStocksRoute:**
BuyStocksRoute-folder consists of three main components: StockPage, MainChart and BuyStocks. StockPage takes care of generally rendering all MainChart and BuyStocks, and the tutorial-animation if needed. The tutorial is shown if the purchase- and currentName-states are empty.

BuyStocks renders a form, which takes the symbol of the company and the amount of stocks. When the user has inputted obligatory information and pressed the "Buy"-button and "Yes" in the confirmation-popup, the buyStock-mutation will be executed, as well as action creators changeStock and buyFirstStock. The call of the action creators ensure that the value of the symbol in the forms gets back to its original value "", and no tutorial animations will be shown anymore. The buyStock-mutation does the following things: \
1. Fetches the company's sticks from last 96 hours no matter what. \
```typescript
// Using self-made function to get the sticks from last 96 hours with the price of every 5 minutes.
const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
```
2. If the stock has not been purchased by any other user, new Stock- and Transaction-object is created. The current user will be updated with a new Transaction and a holding, and the Stock- and Transaction-objects will be saved. This purchase was easy, since the transaction and holding just needed to be added to the correct lists.
```typescript
// Checking if the company has been bought by this or any other user.
const firstBuyEver = await Stock.findOne({stockSymbol: parsedCompany.toUpperCase()})
```
```typescript
// Code below is executed if the company has not been bought by any user.
// A new Stock-object is created and its total amount is the amount of this particular purchase.
// The symbol is always uppercase.
const newStock = new Stock({
    stockTotalAmount: parsedAmount,
    stockSymbol: parsedCompany.toUpperCase()
})
// A new Transaction-object is created and its type is "Buy", of course.
// The date is the current date.
// The price is the last price of the stock. The prices have have been fetched
// with the self-made function getIndividualStockInformation.
const newTransaction = new Transaction({
    transactionType: "Buy",
    transactionDate: createDate(),
    transactionStockPrice: sticks[sticks.length - 1].close,
    transactionStockAmount: parsedAmount,
    transactionStock: newStock._id as string
}).populate("transactionStock")
// The Stock-object is saved to the database.
await newStock.save()
// Searching for the current user from the database. We redefine it as 
// UserType instead of UserType | undefined, because the user exists
// no matter what.
const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType
// A newInformation-objet is created to simplify the code. This object includes
// the new lists of usersTransactions and usersHoldings.
const newInformation = {
    usersTransactions: user.usersTransactions.concat(newTransaction._id), 
    usersHoldings: user.usersHoldings.concat({
        usersStock: newStock._id as mongoose.Types.ObjectId, 
        usersTotalAmount: parsedAmount, 
        usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
    })
}
// The current user is updated in the database with the help of
// previously created newInformation-object.
await User.updateOne({usersUsername: currentUser.usersUsername}, {$set: newInformation})
// The Transaction-object is saved to the database.
await newTransaction.save()
```
3. If the stock isn't new, the code checks whether the **current** user has bought it before. If not, we edit one of the users' holdings and add the transaction:
```typescript
// The code below is executed if the stock has been previously purchased by this particular user.
// One holding is updated with the helper of holdingsArray-array. First of all,
// holdingToBeChanged is searched from the user's holdings and then updated.
// UsersTotalAmount is increased with this purchase's amount, and the total-
// OriginalPriceValue is increased with the price of this purchase * amount.
const holdingsArray = user.usersHoldings
holdingsArray[holdingsArray.indexOf(holdingToBeChanged)] = {
    ...holdingToBeChanged,
    usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), 
    usersTotalOriginalPriceValue: 
        (holdingToBeChanged.usersTotalOriginalPriceValue + (amount * sticks[sticks.length - 1].close))
}
// The relevant Stock-object is updated with the new total amount.
await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {
    $set: {stockTotalAmount: firstBuyEver.stockTotalAmount + amount}
})
// The current user is updated (its transactions and holdings).
await User.updateOne(
    {usersUsername: currentUser.usersUsername},
    {$set: {
            usersTransactions: user.usersTransactions.concat(newTransaction._id),
            usersHoldings: holdingsArray
        }
    }
)
```
