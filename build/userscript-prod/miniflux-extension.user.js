// ==UserScript==
// @name                 Miniflux Extension
// @name:zh-CN           Miniflux Extension
// @namespace            https://github.com/utags/miniflux-extension
// @homepage             https://github.com/utags/miniflux-extension#readme
// @supportURL           https://github.com/utags/miniflux-extension/issues
// @version              0.0.1
// @description          An extension for Miniflux RSS reader
// @description:zh-CN    Miniflux RSS 阅读器扩展
// @icon                 https://miniflux.app/favicon.ico
// @author               Pipecraft
// @license              MIT
// @match                https://miniflux.pipecraft.net/*
// @grant                GM_addElement
// @grant                GM_addStyle
// ==/UserScript==
//
;(() => {
  "use strict"
  var doc = document
  var $ = (element, selectors) =>
    element && typeof element === "object"
      ? element.querySelector(selectors)
      : doc.querySelector(element)
  var createElement = (tagName, attributes) =>
    setAttributes(doc.createElement(tagName), attributes)
  var addEventListener = (element, type, listener, options) => {
    if (!element) {
      return
    }
    if (typeof type === "object") {
      for (const type1 in type) {
        if (Object.hasOwn(type, type1)) {
          element.addEventListener(type1, type[type1])
        }
      }
    } else if (typeof type === "string" && typeof listener === "function") {
      element.addEventListener(type, listener, options)
    }
  }
  var setAttribute = (element, name, value) =>
    element ? element.setAttribute(name, value) : void 0
  var setAttributes = (element, attributes) => {
    if (element && attributes) {
      for (const name in attributes) {
        if (Object.hasOwn(attributes, name)) {
          const value = attributes[name]
          if (value === void 0) {
            continue
          }
          if (/^(value|textContent|innerText|innerHTML)$/.test(name)) {
            element[name] = value
          } else if (name === "style") {
            setStyle(element, value, true)
          } else if (/on\w+/.test(name)) {
            const type = name.slice(2)
            addEventListener(element, type, value)
          } else {
            setAttribute(element, name, value)
          }
        }
      }
    }
    return element
  }
  var setStyle = (element, values, overwrite) => {
    if (!element) {
      return
    }
    const style = element.style
    if (typeof values === "string") {
      style.cssText = overwrite ? values : style.cssText + ";" + values
      return
    }
    if (overwrite) {
      style.cssText = ""
    }
    for (const key in values) {
      if (Object.hasOwn(values, key)) {
        style[key] = values[key].replace("!important", "")
      }
    }
  }
  if (typeof Object.hasOwn !== "function") {
    Object.hasOwn = (instance, prop) =>
      Object.prototype.hasOwnProperty.call(instance, prop)
  }
  var addElement = (parentNode, tagName, attributes) => {
    if (typeof parentNode === "string" || typeof tagName === "string") {
      const element = GM_addElement(parentNode, tagName, attributes)
      setAttributes(element, attributes)
      return element
    }
    setAttributes(tagName, attributes)
    parentNode.append(tagName)
    return tagName
  }
  var addStyle = (styleText) => GM_addStyle(styleText)
  var content_default =
    ".miniflux_ext #left_section{position:fixed;top:0;left:0;padding:20px;overflow:auto;height:100%}"
  var config = {
    matches: ["https://miniflux.pipecraft.net/*"],
  }
  var storageKey = "extension.miniflux.cache"
  function getCategoriesFromCache() {
    const categoriesText = localStorage.getItem(storageKey) || ""
    return createElement("div", {
      class: "items",
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
    addStyle(content_default)
    document.body.classList.add("miniflux_ext")
    const left = addElement(document.body, "section", {
      id: "left_section",
      innerHTML: `<section class="page-header"><h1>Categories</h1></section>`,
    })
    let categories = getCategoriesFromCache()
    if (categories) {
      left.append(categories)
    }
    setTimeout(async () => {
      if (await updateCategories()) {
        console.log("updated")
        categories.remove()
        categories = getCategoriesFromCache()
        if (categories) {
          left.append(categories)
        }
      }
    }, 1e3)
  }
  main()
  addEventListener(document, "DOMContentLoaded", main)
})()
