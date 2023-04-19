import {
  $,
  addElement,
  addEventListener,
  addStyle,
  createElement,
} from "browser-extension-utils"
import styleText from "data-text:./content.scss"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: [
    "https://reader.miniflux.app/*",
    "https://miniflux.pipecraft.net/*",
  ],
}

// 1 minute
const m1 = 1000 * 60

const storageKey = "extension.miniflux.cache"

function getCategoriesFromCache() {
  const categoriesText = localStorage.getItem(storageKey)
  return categoriesText
    ? createElement("div", {
        class: "items",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        innerHTML: categoriesText,
      })
    : null
}

async function updateCategories() {
  const response = await fetch("/categories")
  if (response.status === 200) {
    const text = await response.text()
    const div = createElement("div")
    div.innerHTML = text
    const categories = $(div, ".items")
    if (categories?.innerHTML) {
      const categoriesText = localStorage.getItem(storageKey)
      if (categoriesText !== categories.innerHTML) {
        localStorage.setItem(storageKey, categories.innerHTML)
        return true
      }
    }
  }

  return false
}

const appendCategories = () => {
  const container = $("[data-miniflux_ext] #left_section")
  if (!container) {
    return
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  let categories: Element | null = $("[data-miniflux_ext] #left_section .items")
  if (categories) {
    categories.remove()
  }

  // Load categories from cache
  categories = getCategoriesFromCache()
  if (categories) {
    container.append(categories)
  }
}

async function autoUpdateCategories() {
  if (await updateCategories()) {
    appendCategories()

    setTimeout(autoUpdateCategories, 3 * m1)
  } else {
    setTimeout(autoUpdateCategories, 10 * m1)
  }
}

async function main() {
  if (!document.body || $("[data-miniflux_ext] #left_section")) {
    return
  }

  addStyle(styleText)

  document.body.dataset.miniflux_ext = "1"
  addElement(document.body, "section", {
    id: "left_section",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    innerHTML: `<section class="page-header"><h1>Categories</h1></section>`,
  })

  // Add categories immediately
  appendCategories()

  // Start auto update catetories
  setTimeout(autoUpdateCategories, 1000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
addEventListener(document, "DOMContentLoaded", main)
