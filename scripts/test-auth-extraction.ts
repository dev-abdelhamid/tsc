import { login, register } from "../lib/api/services/auth.service"

// Mock the api client
jest.mock("../lib/api/client", () => ({
  api: {
    post: jest.fn()
  }
}))

import { api } from "../lib/api/client"

async function runTests() {
  console.log("Running Auth Service extraction tests...")

  // Test Case 1: Backend returns user inside data.user
  ;(api.post as any).mockResolvedValueOnce({
    data: {
      user: { id: 1, name: "Test User", email: "test@example.com", role: "company" },
      access_token: "token123"
    }
  })

  const res1 = await login("test@example.com", "password", "company")
  console.log("Test 1 Result:", res1.user.name === "Test User" && res1.tokens.access_token === "token123" ? "PASSED" : "FAILED")

  // Test Case 2: Backend returns user at root of data
  ;(api.post as any).mockResolvedValueOnce({
    data: {
      id: 2,
      name: "Root User",
      email: "root@example.com",
      role: "company",
      access_token: "token456"
    }
  })

  const res2 = await login("root@example.com", "password", "company")
  console.log("Test 2 Result:", res2.user.name === "Root User" && res2.tokens.access_token === "token456" ? "PASSED" : "FAILED")

   // Test Case 3: Token inside data.tokens
  ;(api.post as any).mockResolvedValueOnce({
    data: {
      user: { id: 3, name: "Token User", email: "token@example.com", role: "user" },
      tokens: { access_token: "token789" }
    }
  })

  const res3 = await login("token@example.com", "password", "user")
  console.log("Test 3 Result:", res3.user.name === "Token User" && res3.tokens.access_token === "token789" ? "PASSED" : "FAILED")

  console.log("Tests complete.")
}

// runTests()
