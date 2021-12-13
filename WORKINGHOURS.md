| date  | time | commit(s) | description | 
|:-----:|:----:| :-----: | :---- |
| 15.8. | 5 | 71a78e4-403da4f | Started the project, installed some dependencies, started the UI --> app bar, side bar, login page and login form, initiated Redux and created a state for side bar
| 22.8. | 6 | 2dfd084 | Initiated the backend (initialized MongoDB, GraphQL and bcrypt), connected frontend's login form to backend with Apollo, styling frontend, addUser-mutation |
| 25.8. | 9 | 7f4aecd | Login-mutation, me-query, individualStock-query created with Finnhub Stock API and @stockey/finnhub, started to use tokens for login. Buy stocks -page to frontend, edits to app bar, connected login form with Redux, styling. Buy stocks form created, chart for stocks with react-apexcharts, connected buy stocks -form with Redux, form for sign up. |
| 27.8. | 7 | 647f303 | Edits to frontend and backend to give the client a possibility to buy stocks, initialization of Eslint and fixed eslint errors |
| 28.8. | 8 | 3c6c5ce | Backend refactored and more typing, list of holdings and transactions to User-model, now holdings & transactions update when a stock is purchased |
| 1.9. | 6 | 2ac6739-be3e033 | Setting up Heroku and built to Heroku, pipeline initialization, refactoring, express to backend |
| 2.9. | 6 | 51b3ef8-423f1d5 | Built pipeline with Github Actions through massive problems |
| 4.9. | 5 | fb757a6-d515be1 | Added My profile -page, changes to resolvers and gql-typing |
| 5.10. | 10 | 9e4354c-136abd8 | Added Transactions-section to My profile -page, big fixes to the buyStock-mutation, added currentPortfolioValue-query and its type definitions, fixed eslint errors, portfolio's value to My profile |
| 6.10. | 6 | 85bf2ff | Fragment STOCKDETAILS to frontend, new features to Transactions-section, added Analysis-section to MyProfile and the AnalysisChart, changes to backend's resolvers |
| 9.10. | 7 | bdbdcd7 | Refactoring, new Redux reducer, edits to the chart in Analysis-section (2 modes: days and hours, reducer to manage these modes), table of the positions to the Analysis-section |
| 13.10. | 8 | e8f072f | OldData to My profile (up to 20-year-old data of the positions), confirmations and notifications after a stock purchase, reformatted charts |
| 14.10. | 6 | 700c60f-7c62d05 | Fixes to backend, pondering with the pipeline |
| 24.10. | 6 | 717c8ed | Created sell-form and other changes to the frontend, refactoring backend, better error handling to backend, type guards added |
| 6.11. | 5 | 43159b5 | Refactoring, created the possibility to sell positions (backend's sellStock-mutation & frontend), new type guard, yup validation to a form, error texts to forms, loading animation |
| 9.11. | 5 | f7e4e4 | Added moneyMade to User-model, more validation to forms, sign up form to frontend at last, general fixes, tutorial animation |
| 11.11. | 6 | 55d7127 | Started to work with GraphQL's subscriptions (frontend & backend, added STOCK_PURCHASED subscription), reordered some files, more error handling to the frontend, refactoring, polished tutorial animation |
| 12.11. | 9 | 6ad5d28-902a50a | Added S5TOCK_PURCHASED-subscription to frontend and with its help made MyProfile more real-time (updates whenever a stock is sold/purchased), refactoring and more error handling to forms. Started to order files and folders, better TransactionList, fixed a lot of bugs |
| 13.11. | 9 | ea02635-ed19db6 | Working with the pipeline. Started to build the social side of this project - resolvers for following users and for searching a user from the database, many new fields to User-model, started to develop the Explore-page, removed the file structure edits from yesterday |
| 4.12. | 6 | 2c64297 | Fixed an error that occured while logging out, changes in frontend routing, added SpecificExplore-component (after user search you get to their personal page which is almost like MyProfile, you can follow others users and view their statistics in the client, fixed minor errors, better search bar's autocomplete |
| 5.12. | 6 | bc30ca1 | Added subscription for follow events as well, added possibility to unfollow users, updated STOCK_PURCHASED-subscription so that only followers get the published notifications from the backend |
| 6.12. | 7 | f35e741 | Refactoring and changing file structure, added one more type guard, finished ActionsPage and everything regarding to it, actionNotificationReducer to prevent multiple notifications of the same event, edits to followEvent-subscription, backend almost fully explained with comments |
| 7.12. | 5 | 487a969-4d5dbf1 | Refactoring and explaining code with comments, renaming, new type guards, editing and fixing pipeline |
| 8.12. | 9 | a6cfd32 | Finished documenting, changed the first stick to show to user in the Analysis-section (had to add an item usersFirstPurchase to User-model so that first stick is now the date when the first stock in the portfolio was purchased), polishing and refactoring, fixing problems, many new type guards, better error handling, reorganizing files, created my own ApolloError, better typeDefs in the backend. Deleted some useless code, changes to userLoggedReducer (it now saves the name of the logged-in-user), big changes in styling (no more inline-styles). |
| 11.12. | 14 | 7797592-1cfc466 | Fixing pipeline and making cypress-tests to work both locally and in the pipeline | 
| 12.12. | 8 | 2ba10c3-2f9a3e1 | Made bunch of Jest-tests to the frontend and backend. |
|| 184 |||
