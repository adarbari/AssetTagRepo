/**
 * Test Helper Functions
 * 
 * Reusable utilities for testing components
 */

import { waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Wait for loading indicators to finish
 */
export const waitForLoadingToFinish = () =>
  waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument())

/**
 * Setup user event with common options
 */
export const setupUser = () => userEvent.setup()

/**
 * Click a button by its accessible name
 */
export const clickButtonByName = async (name: string | RegExp) => {
  const user = setupUser()
  const button = screen.getByRole('button', { name })
  await user.click(button)
  return button
}

/**
 * Wait for an element to appear
 */
export const waitForElement = async (role: string, name?: string | RegExp) => {
  return await waitFor(() => {
    if (name) {
      return screen.getByRole(role as any, { name })
    }
    return screen.getByRole(role as any)
  })
}

/**
 * Check if element is visible in the document
 */
export const isElementVisible = (element: HTMLElement): boolean => {
  return element.style.display !== 'none' && element.style.visibility !== 'hidden'
}

/**
 * Get all buttons with a specific accessible name pattern
 * Useful when there are multiple buttons with similar names
 */
export const getAllButtonsByName = (name: string | RegExp) => {
  return screen.getAllByRole('button', { name })
}

/**
 * Fill in a form field by label
 */
export const fillFormField = async (label: string | RegExp, value: string) => {
  const user = setupUser()
  const field = screen.getByLabelText(label)
  await user.clear(field)
  await user.type(field, value)
  return field
}

/**
 * Submit a form by finding the submit button
 */
export const submitForm = async (buttonText: string | RegExp = /submit|save|create/i) => {
  return await clickButtonByName(buttonText)
}

/**
 * Wait for dialog to open
 */
export const waitForDialog = async () => {
  return await waitFor(() => screen.getByRole('dialog'))
}

/**
 * Close dialog by clicking close button
 */
export const closeDialog = async (buttonText: string | RegExp = /close/i) => {
  const closeButtons = screen.getAllByRole('button', { name: buttonText })
  // Usually the last close button is the one in the footer
  const closeButton = closeButtons[closeButtons.length - 1]
  const user = setupUser()
  await user.click(closeButton)
}

/**
 * Mock fetch response for a specific URL pattern
 */
export const mockFetchResponse = (url: string | RegExp, response: any, status: number = 200) => {
  const mockFetch = global.fetch as any
  mockFetch.mockImplementation((fetchUrl: string) => {
    const matches = typeof url === 'string' ? fetchUrl.includes(url) : url.test(fetchUrl)
    
    if (matches) {
      return Promise.resolve({
        ok: status >= 200 && status < 300,
        status,
        statusText: status === 200 ? 'OK' : 'Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => response,
        text: async () => JSON.stringify(response),
        blob: async () => new Blob(),
        arrayBuffer: async () => new ArrayBuffer(0),
        formData: async () => new FormData(),
        clone: () => ({}),
      } as Response)
    }
    
    // Default response for unmatched URLs
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
      clone: () => ({}),
    } as Response)
  })
}

/**
 * Wait for async data to load
 * Useful for components using useAsyncData hook
 */
export const waitForAsyncData = async (timeout: number = 3000) => {
  await waitFor(() => {
    // Check that we're not in a loading state
    const loadingIndicators = screen.queryAllByRole('progressbar')
    const loadingText = screen.queryByText(/loading/i)
    expect(loadingIndicators.length).toBe(0)
    expect(loadingText).not.toBeInTheDocument()
  }, { timeout })
}

