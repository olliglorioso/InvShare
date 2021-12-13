# InvShare
![image](https://user-images.githubusercontent.com/84347872/145859451-a2b92507-f51e-41d9-898a-ff750bc7a6e8.png)
InvShare is my final project for the Full Stack open 2021 by the University of Helsinki. 

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
SLACK_WEBHOOK_URL is the url for the Slack-App (pipeline sends a notification to a Slack group when completed).

## Description of the app
InvShare is a website for sharing your stock portfolio. You can copy your real-life portfolio or just play with imaginary money and try to make as much profit as possible. Currently you can only use the app with the stock symbols of NYSE, such as TSLA, AAPL, NOK, MSFT, AMZN, A, or B. This because the best solutions for Stock APIs did not offer anything better for free and the budget for this project was not too overwhelming. 

## Technologies, (relevant) libraries and services used
The whole app uses TypeScript as its primary programming language, tests are written in JavaScript. The most important technologies in this project were React, TypeScript, Node.js, GraphQL and MongoDB. Since this wasn't too big of a software project, cloud-based Github Actions was an obvious choice for CI/CD. 

**Frontend:**
- Visual elements: [material-ui](https://www.npmjs.com/package/@material-ui/core) for design, [react-apexcharts](https://www.npmjs.com/package/react-apexcharts) for charts, [react-confirm-alert](https://www.npmjs.com/package/react-confirm-alert) for notifications, [react-simple-animate](https://www.npmjs.com/package/react-simple-animate) for animations
- Forms: [formik](https://www.npmjs.com/package/formik), [yup](https://www.npmjs.com/package/yup) for validation
- State handling: [redux](https://www.npmjs.com/package/redux)
- Interaction with the backend: [@apollo/client](https://www.npmjs.com/package/@apollo/client), [graphql-tag](https://www.npmjs.com/package/graphql-tag)
- Cyber security: [bcrypt](https://www.npmjs.com/package/bcrypt), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- Testing: [cypress](https://www.npmjs.com/package/cypress), [jest](https://www.npmjs.com/package/jest)

**Backend:**
- Stock APIs: [Finnhub Stock API](https://finnhub.io), [Alpha vantage Stock API](https://www.alphavantage.co)
- MongoDB: [mongoose](https://www.npmjs.com/package/mongoose), [mongoose-unique-validator](https://www.npmjs.com/package/mongoose-unique-validator) for validation
- Interaction with the frontend: [apollo-server-express](https://www.npmjs.com/package/apollo-server-express), [express](https://www.npmjs.com/package/express)

## Introduction video to the app
[https://streamable.com/542l7c](https://streamable.com/542l7c)\
There is an error in the video: a date has the format NN:NN:NN. This is because the stocks related to the error were manually added to the backend and the developer made a humane error. There is no problem with the app itself.

## Explanation of code
**ActionsRoute:**\
This page shows the transactions of the users that the logged-in-user has followed, both sales and purchases. It fetches data from the backend by using query getActions:
```typescript
getActions: async (
    _root: undefined,
    _args: void,
    {currentUser}: {currentUser: PopulatedUserType}
): Promise<{transaction: TransactionType, transactionOwner: string}[]> => {

    const followersTransactions = 
        (currentUser.usersFollowing.map((item: {user: PopulatedUserType, date: string}) => item.user))
        .map((item: PopulatedUserType) => {return {
            transactions: item.usersTransactions, 
            transactionOwner: item.usersUsername}
        })

    const transactionList: {transaction: TransactionType, transactionOwner: string}[] = []

    for (const item of followersTransactions) {
        for (const o of item.transactions) {
            transactionList.push({transaction: o, transactionOwner: item.transactionOwner})
        }
    }

    const orderedTransactions = transactionList.sort((
        a: {transaction: TransactionType, transactionOwner: string}, 
        b: {transaction: TransactionType, transactionOwner: string}) => {
        return new Date(a.transaction.transactionDate).getTime() - new Date(b.transaction.transactionDate).getTime()
    }).reverse()

    return orderedTransactions
}
```
GetActions-query gets the transactions of the users that the current user follows from the query's context. Then the query creates an object for every transaction, and the object contains the creator of the transactions as well. Then the list is sorted by date and returned to the frontend, which with the help of TransactionList-component renders the "actions", also known as transactions.

**BuyStocksRoute:**\
BuyStocksRoute-folder consists of three main components: StockPage, MainChart and BuyStocks. StockPage takes care of generally rendering all MainChart and BuyStocks, and the tutorial-animation if needed. The tutorial is shown if the purchase- and currentName-states are empty.

BuyStocks renders a form, which takes the symbol of the company and the amount of stocks. When the user has inputted obligatory information and pressed the "Buy"-button and "Yes" in the confirmation-popup, the buyStock-mutation will be executed, as well as action creators changeStock and buyFirstStock. The call of the action creators ensure that the value of the symbol in the forms gets back to its original value "", and no tutorial animations will be shown anymore. The buyStock-mutation does the following things: \
1. Fetches the company's sticks from last 96 hours no matter what. The last stick of this result will include the (last) price of the stock and it will be saved to the database. \
```typescript
const sticks = await getIndividualStockInformation(parsedCompany, setDate(-96), "5")
```
2. If the stock has not been purchased by any other user, new Stock- and Transaction-object is created. The current user will be updated with a new Transaction and a holding, and the Stock- and Transaction-objects will be saved. This purchase was easy, since the transaction and holding just needed to be added to the correct lists.
```typescript
const firstBuyEver = await Stock.findOne({stockSymbol: parsedCompany.toUpperCase()})
```
```typescript

const newStock = new Stock({
    stockTotalAmount: parsedAmount,
    stockSymbol: parsedCompany.toUpperCase()
})

const newTransaction = new Transaction({
    transactionType: "Buy",
    transactionDate: createDate(),
    transactionStockPrice: sticks[sticks.length - 1].close,
    transactionStockAmount: parsedAmount,
    transactionStock: newStock._id as string
}).populate("transactionStock")

await newStock.save()

const user = await User.findOne({usersUsername: currentUser.usersUsername}) as UserType

const newInformation = {
    usersTransactions: user.usersTransactions.concat(newTransaction._id), 
    usersHoldings: user.usersHoldings.concat({
        usersStock: newStock._id as mongoose.Types.ObjectId, 
        usersTotalAmount: parsedAmount, 
        usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice,
    })
}

await User.updateOne({usersUsername: currentUser.usersUsername}, {$set: newInformation})

await newTransaction.save()
```
3. If the stock isn't new, the code checks whether the **current** user has bought it before. If not, we edit the corresponding holding and add the transaction:
```typescript
const holdingsArray = user.usersHoldings
holdingsArray[holdingsArray.indexOf(holdingToBeChanged)] = {
    ...holdingToBeChanged,
    usersTotalAmount: (holdingToBeChanged.usersTotalAmount + parsedAmount), 
    usersTotalOriginalPriceValue: 
        (holdingToBeChanged.usersTotalOriginalPriceValue + (amount * sticks[sticks.length - 1].close))
}

await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)}, {
    $set: {stockTotalAmount: firstBuyEver.stockTotalAmount + amount}
})

await User.updateOne(
    {usersUsername: currentUser.usersUsername},
    {$set: {
            usersTransactions: user.usersTransactions.concat(newTransaction._id),
            usersHoldings: holdingsArray
        }
    }
)
```
4. If the user has bought the stock before, we update the corresponding stock, add both the transaction to usersTransations and aholding to usersHoldings.
```typescript
await Stock.updateOne({_id: (firstBuyEver._id as mongoose.Types.ObjectId)},
    {$set: {
        stockTotalAmount: firstBuyEver.stockTotalAmount + parsedAmount
    }
})

await User.updateOne({usersUsername: currentUser.usersUsername}, 
    {$set: {
        usersTransactions: user.usersTransactions.concat(newTransaction._id),
        usersHoldings: user.usersHoldings.concat({
            usersStock: firstBuyEver._id as mongoose.Types.ObjectId,
            usersTotalAmount: parsedAmount,
            usersTotalOriginalPriceValue: parsedAmount * newTransaction.transactionStockPrice
        })
    }}
```
When the user writes to the company-field, also the MainChart changes its content. IndividualStock-query will be executed, and it returns the sticks that are fetched from the Finnhub Stock API. 

**ExploreRoute:**\
The ExploreRoute-folder consists of ExplorePage-, SpecificExplore- and UserSearch-components. ExplorePage renders the UserSearch and has the Formik-component, which manages the UserSearch-form. UserSearch is almost like a normal text field, but it has Autocomplete-component. This updates 750 milliseconds after the user has stopped writing to the text field (with the help of useDebounce). When the user stops writing, the constant parsedUsername changes, which leads into the change of debounceName, which causes useEffect to possibly run searchUser-query.
```typescript
useEffect(() => {
    if (debounceName !== "") {
        searchUser({ variables: { username: debounceName } });
    }
}, [debounceName]);
```
If there is a result, searchResult.data changes, which causes another useEffet to run setOptions-function, that changes the options of the Autocomplete-component. Autocomplete will be re-rendered with a new list of usernames to show.
```typescript
useEffect(() => {
    if (searchResult.data?.searchUser !== undefined) {
        setOptions(searchResult.data.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername));
    } else {
        setOptions([]);
    }
}, [searchResult.data]);
```
The search includes all the users that share the same first letters than the search:
```typescript
const users = await User.find({usersUsername: {$regex: `^(?i)${parsedUsername}`}})
    .populate({path: "usersFollowers", populate: {path: "user"}})
    .populate({path: "usersFollowing", populate: {path: "user"}})
    .populate({path: "usersHoldings", populate: {path: "usersStock"}})
    .populate({path: "usersTransactions", populate: {path: "transactionStock"}}) as unknown as PopulatedUserType[]
```
When a name from the Autocomplete-component's list is pressed / the user has searched for the specific user, the searchUser-query will be executed again and only one user will be returned, of course. This includes all the information that is relevant.

When the search is done, SpecificExplore will be rendered with the results of the searchUser-query. SpecificExplore has follow/unfollow button, which causes either followUser- or unfollowUser-mutation to run. They update both the user that follows and the user that was followed. This is from followUser:
```typescript
await User.updateOne({_id: currentUser._id}, {
    $push: {usersFollowing: {user: parsedUser._id, date: new Date().toString()}}, 
    $set: {followingCount: (currentUser.followingCount || 0) + 1}
})
await User.updateOne({_id: parsedUser._id}, {
    $push: {usersFollowers: {user: currentUser._id, date: new Date().toString()}}, 
    $set: {followerCount: (parsedUser.followerCount || 0) + 1}
})
```
After that, pubsub-object publishes the followEvent:
```typescript
pubsub.publish("FOLLOWEVENT", {followEvent: {
    followType: "follow", 
    auteur: currentUser.usersUsername, 
    object: parsedUser.usersUsername, 
    date: new Date()},
    myFollowers: currentUser.usersFollowers
})
```
This notification has the followers of the user that followed another user, the auteur of the followEvent and the user that was followed (object). Also date and followType, which is either "follow" or "unfollow". SpecificExplore and MyProfile subscribes for these notifications, so they can update real-time.

**LoginRoute:**\
LoginRoute-folder includes SignUpForm, LoginForm and LoginPage. LoginPage works similarly as the other -Page-components, LoginForm is a form that executes the login-mutation, and SignUpForm is also a form that executes the addUser-mutation. AddUser just adds a new user to the database, the password is hashed with bcrypt's hash-function. Login-mutation compares the database's hashed password to the given password and either returns a token or not. If the password is correct, the logUserIn action creator will be executed and it updates the state, which tells whether the user has logged in or not in the browser. After state update the user is pushed to the default page and now logged in. The site can be reloaded, because state will be re-fetched from the local storage. Now with every request an authorization header with token will be sent to the backend. With the help of the ApolloServer's context every resolver gets now the information of the user that has logged in (if the token is correct):
```typescript
if (auth && auth.toLowerCase().startsWith("bearer ")) {
    const decodedToken = <{id: string, iat: number}>jwt.verify(auth.substring(7), (process.env.SECRETFORTOKEN as string));
    const currentUser = await User.findById(decodedToken.id)
        .populate({path: "usersHoldings", populate: {path: "usersStock"}})
        .populate({path: "usersTransactions", populate: {path: "transactionStock"}})
        .populate({path: "usersFollowing", populate: {path: "user", populate: {path: "usersTransactions", populate: {path: "transactionStock"}}}})
        .populate({path: "usersFollowers", populate: {path: "user"}}) as unknown as PopulatedUserType
    return {currentUser};
}
```
**MyProfileRoute:**\
MyProfileRoute-folder includes components AnalysisTable and -Chart, MyProfile, OldData, TransactionList and TutorialAnimation. TutorialAnimation is responsible for rendering the tutorial animation in the page, if there are no stocks in the portfolio. MyProfile-component is the most important. In the beginning, it runs the me-query, which just returns the currentUser from the backend's ApolloServer's context (if someone has logged in, otherwise error). Then it runs currenPortfolioValue-query with different modes. It gets usersFirstPurchaseDate from the database and starts to iterate usersHoldings. The query fetches sticks from the last 96 hours with 5-minute resolution, and we get the variable denseSticks. If first purchase date is newer than 96 hours to the past, sticks are filtered that they only include sticks that are newer than first purchase date.
```typescript
new Date(firstBuyDate) > setDate(-96)
? sticks = denseSticks.filter((item: CandlesType) => {return new Date(item.date) > new Date(firstBuyDate)})
: sticks = denseSticks
```
If the mode is days, daily sticks are fetched. If there are no sticks, we just take the newest stick from denseSticks. Then previously created list, values, is updated by concatting an object that includes the of the holding currently in the iteration, and its sticks. To the previously created sum we add the last sticks' close-value multiplied by the holdings' total amount.
```typescript
values = values.concat({name: a[0].stockSymbol, sticks})
sum += sticks[sticks.length - 1].close * item.usersTotalAmount
```
In the end, values and sum are returned. MyProfile has a state, mode, that decides whether Analysis- or Transaction-section will be shown. If the results of the currentPortfolioValue-queries are ready, they are passed to Analysis-component, which passes them to AnalysisTable. The result of me-query is passed to TransactionList-component. TransactionList renders as previously explained, if it is open. The total original value is calculated by reducing usersHoldings:
```typescript
const totalOriginalValue = meResult.data.me.usersHoldings.reduce(
    (acc: number, curr: Holdings
    ) => {
        return acc + curr.usersTotalOriginalPriceValue;
    },
    0
);
```
And it is rendered. Current profit percentage is calculated by taking currentPortfolioValue's sum and dividing it with totalOriginValue.
```typescript
const currentProfitPercentage = (parseFloat((100 * (-1 + hoursData.data.currentPortfolioValue[0].wholeValue / totalOriginalValue)).toString())).toFixed(2);
```
This is rendered as well. AnalysisChart gets many props:
```typescript
<AnalysisChart
    totalOriginalValue={totalOriginalValue}
    analysisData={analysisData.analysisValues}
    holdings={meResult.data.me.usersHoldings}
    isTogglable={!daysData.data}
/>
```
AnalysisChart gets its mode (days our hours) from the Redux state. In the beginning, it gets the stock with least sticks (Finnhub API returns different amount of sticks for different companies).
```typescript
let leastSticks = 0;
let leastSticksStock = analysisData[0];
analysisData.forEach((oneStock: AnalysisData) => {
    if (oneStock.sticks.length < leastSticks) {
        leastSticksStock = oneStock;
        leastSticks = leastSticksStock.sticks.length;
    }
});
```
We loop through these dates. 
```typescript
dates.forEach((oneDate: string) => {
```
The component goes through every stick in the list of sticks for every stock. 
```typescript
analysisData.forEach((oneStock: AnalysisData) => {
```
If the stock has a stick that has the same date as the date currently in iteration, we add to the previously created sum the close-value of the chosen stick multiplied by the total amount of the stock that the user has.
```typescript
const valueToAdd = oneStock.sticks.filter((oneStick: CandleStock) => {
    return oneStick.date === oneDate;
});
if (valueToAdd.length > 0) {
    sum = sum + valueToAdd[0].close * holdings.filter((pos: Holdings) => pos.usersStock.stockSymbol === oneStock.name)[0]?.usersTotalAmount;
```
If the stick doesn't exist, we just use the value that is the closest to the date in the iteration. Search is executed:
```typescript
oneStock.sticks.forEach((oneStick: CandleStock) => {
    const time = Math.abs(new Date(oneStick.date).getTime() - new Date(oneDate).getTime());
    if (time < biggestDiff) {
        biggestDiff = time;
        stickToSum = oneStick;
    }
    });
```
Chart's options are configured: y-values are the previously gotten prices and x-values are dates. Under the chart situates the table. The table is just a basic table with every stock with a button and some important values. If the user presses the button, stockHistory-query will be run (fetches up to 20-year-old data form Alpha Vantage's stock API). This data will then be shown under the table (chart) with the OldData-component. 

MyProfile-component subscribes to stockEvent, and every time the user sells or purchases a stock, the queries in the MyProfile-component will be refetched.
```typescript
useEffect(() => {
    if (stockSubscription || followSubscriptions) {
        try {
            meResult.refetch();
            hoursData.refetch();
            daysData.refetch();
        } catch (e: unknown) {
            notification("An error occured.", "Error while downloading updates and new information.", "danger");
        }
    }
}, [stockSubscription, followSubscriptions]);
```

**Pipeline's location is .github/pipeline.yml.**\
**Cypress tests' location is frontend/cypress/integration/maintests.spec.js.**
