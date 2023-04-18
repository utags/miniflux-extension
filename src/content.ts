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
  matches: ["https://miniflux.pipecraft.net/*"],
}

const storageKey = "extension.miniflux.cache"

function getCategoriesFromCache() {
  const categoriesText = localStorage.getItem(storageKey) || ""
  return createElement("div", {
    class: "items",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    innerHTML: categoriesText,
  })
}

async function updateCategories() {
  const response = await fetch("/categories")
  if (response.status === 200) {
    const text = await response.text()
    const div = createElement("div")
    div.innerHTML = text
    const categories = $(div, ".items")
    if (categories) {
      const categoriesText = localStorage.getItem(storageKey) || ""
      if (categoriesText !== categories.innerHTML) {
        localStorage.setItem(storageKey, categories.innerHTML)
        return true
      }
    }
  }

  return false
}

async function main() {
  if (!document.body || $(".miniflux_ext #left_section")) {
    return
  }

  addStyle(styleText)

  document.body.classList.add("miniflux_ext")
  const left = addElement(document.body, "section", {
    id: "left_section",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    innerHTML: `<section class="page-header"><h1>Categories</h1></section>`,
  })

  // Load categories from cache
  let categories = getCategoriesFromCache()
  if (categories) {
    left.append(categories)
  }

  // Update cache
  setTimeout(async () => {
    if (await updateCategories()) {
      console.log("updated")
      categories.remove()
      categories = getCategoriesFromCache()
      if (categories) {
        left.append(categories)
      }
    }
  }, 1000)
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises, unicorn/prefer-top-level-await
main()
addEventListener(document, "DOMContentLoaded", main)
