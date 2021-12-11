it("reseting database and signing up", () => {
    cy.intercept("POST", "https://fso2021practicework.herokuapp.com/graphql", (req) => {
        req.redirect("http://localhost:3001/graphql");
    });
    cy.visit("http://localhost:3001/resetdatabase");
    cy.contains("Success!");
    cy.visit("http://localhost:3001/login");
    cy.get("#usernameSignUp").type("testi800");
    cy.get("#passwordSignUp").type("testi800");
    cy.get("#password_again").type("testi800");
    cy.get("#signUpButton").click();
    cy.contains("Yes").click();
    cy.contains("You created an account with the name testi800.");
    cy.visit("http://localhost:3001/login");
    cy.get("#usernameSignUp").type("testi900");
    cy.get("#passwordSignUp").type("testi900");
    cy.get("#password_again").type("testi900");
    cy.get("#signUpButton").click();
    cy.contains("Yes").click();
    cy.contains("You created an account with the name testi900.");
});

describe("main functions", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3001/login");
        cy.contains("InvShare");
        cy.get("#username").type("testi800");
        cy.get("#password").type("testi800");
        cy.get("#tryToLoginButton").click();
        cy.contains("You are logged in.");
        cy.get("#sideBarButton").click();
    });
    it("you can purchase stocks and the animations work", () => {
        cy.get("#toMyProfile").click();
        cy.contains("Open the sidebar!");
        cy.get("#toBuyStocks").click();
        cy.contains("Write here the symbol & select an amount.");
        cy.get("#toBuyStocks").type("{esc}", {force: true});
        cy.get("#company").type("AAPL");
        cy.contains("Press buy and confirm.");
        cy.get("#amount").type("10");
        cy.contains("Buy").click();
        cy.contains("Yes").click();
        cy.contains("You purchased: 110 x AAPL.");
    });
    it ("myprofile behaves correctly", () => {
        cy.get("#toMyProfile").click();
        cy.contains("testi800");
        cy.contains("Followers");
        cy.contains("110");
        cy.contains("AAPL");
        cy.get("#toMyProfile").type("{esc}", {force: true});
        cy.get("#toTransactions").click();
        cy.get("#openTransaction").click();
        cy.contains("Price per share");
        cy.contains("Analysis").click();
        cy.get("#openOldData").click();
        cy.contains("Old data:");
    });
    it("explore and actions work correctly", () => {
        cy.contains("Explore");
        cy.get("#toExplore").type("{esc}", {force: true});
        cy.contains("Log out").click();
        cy.visit("http://localhost:3001/login");
        cy.get("#username").type("testi900");
        cy.get("#password").type("testi900");
        cy.get("#tryToLoginButton").click();
        cy.contains("You are logged in.");
        cy.get("#sideBarButton").click();
        cy.get("#toExplore").click();
        cy.contains("Explore");
        cy.get("#toExplore").type("{esc}", {force: true});
        cy.get("#username").type("testi");
        cy.contains("testi800").click();
        cy.contains("Follow").click();
        cy.contains("You followed testi800.");
        cy.visit("http://localhost:3001/actions");
        cy.contains("testi800");
    });
    
});