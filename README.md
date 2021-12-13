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
MONGODB_TEST_URI is the endpoint for the test database.
MONGODB_URI is the endpoint for the database.
PORT is the port.
SECRETFORTOKEN is a secret for the encryption of passwords.
SLACK_WEBHOOK_URL is the url for the Slack-App (pipeline sends a notification to a Slack group when completed).

## Description of the app
InvShare is a website for sharing your stock portfolio. You can copy your real-life portfolio or just play with imaginary money and try to make as much profit as possible. Currently you can only use the app with the stock symbols of NYSE, such as TSLA, AAPL, NOK, MSFT, AMZN, A, or B. This because the best solutions for Stock APIs did not offer anything better for free and the budget for this project was not too overwhelming. 

## Technologies, (relevant) libraries and services used
The whole app uses TypeScript as its primary programming language, tests are written in JavaScript. The most important technologies in this project were React, TypeScript, Node.js, GraphQL and MongoDB. Since this was still quite small medium-sized software project, cloud-based Github Actions was an obvious choice for CI/CD. 

**Frontend:**a
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
**ActionsRoute**
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
GetActions-query 
