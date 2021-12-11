# InvShare
InvShare is the final part of Full Stack open 2021 by the University of Helsinki. The project, which is worth of 5, 7 or 10 credits, should be implemented in React and/or Node. 

## Heroku link
[heroku](https://fso2021practicework.herokuapp.com/)

## Run locally

In order to start the app in development, run these commands in the root folder...

```npm run install:all```

```npm run run:backend```

```npm run run:frontend```

...and open http://localhost:3000.

## Description of the app
InvShare is a website for sharing your stock portfolio. You can copy your real-life portfolio or just play with imaginary money and try to make as much profit as possible. Currently you can only use the app with the stock symbols of NYSE, such as TSLA, AAPL, NOK, MSFT, AMZN, A, or B. This because the best solutions for Stock APIs did not offer anything better for free and the budget for this project was not too overwhelming. 

## Technologies, (relevant) libraries and services used
The whole app uses TypeScript as its primary programming language. The most important technologies in this project were React, TypeScript, Node.js, GraphQL and MongoDB. Since this was still quite small medium-sized software project, cloud-based Github Actions was an obvious choice for CI/CD. 

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
