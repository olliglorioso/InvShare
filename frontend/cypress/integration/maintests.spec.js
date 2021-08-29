describe("front page", () => {
    beforeEach(() => {
        cy.visit("http://localhost:3000")
    })
    it("logging in is possible", () => {
        cy.contains("InvShare")
        cy.get("#loginButton").click()
        cy.get("#username").type("testi")
        cy.get("#password").type("testi")
        cy.get("#tryToLoginButton").click()
        cy.contains("InvShare")
    })
})