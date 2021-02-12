import * as puppeteer from "puppeteer"
import { urlParts } from "./util"

function extractItems() {
  function extractDataFromRow(row: HTMLElement) {
    let id = row
      .querySelector<HTMLAnchorElement>("td:nth-child(2) a")
      ?.href.match(/\/(\d+)[^\/]*$/)?.[1]

    let gfxId = row
      .querySelector<HTMLImageElement>("td:nth-child(1) img")
      ?.src.match(/\/(\d+)(?:\.w\d\dh\d\d)?\.png$/)?.[1]

    let rarity =
      row
        .querySelector("td:nth-child(2)")
        ?.querySelector(".ak-icon-small")
        ?.className.match(/ak-rarity-(\d)/)?.[1] ?? "1"

    let title =
      row.querySelector<HTMLElement>("td:nth-child(2)")?.innerText ?? ""

    let type =
      row
        .querySelector<HTMLImageElement>(".item-type img")
        ?.src.match(/\/category\/(\d+)\.png$/)?.[1] ?? "-1"

    let level =
      row
        .querySelector<HTMLElement>(".item-level")
        ?.innerText.match(/(\d+)/)?.[1] ?? "0"

    return { id, gfxId, rarity, title, type, level }
  }

  let rows = document.querySelectorAll("tbody tr") ?? []
  return [...rows].map(extractDataFromRow)
}

async function isLastPage(page: puppeteer.Page): Promise<boolean> {
  return await page.evaluate(() => {
    return (
      (document
        .querySelector(".ak-pagination li:last-child")
        ?.className.includes("disabled") ??
        true) ||
      (document.querySelector(".ak-list-info-no-item") ? true : false)
    )
  })
}

async function navigateThroughPages(page: puppeteer.Page, baseUrl: string) {
  let items = [] as ReturnType<typeof extractItems>
  for (let pageNum = 1; ; pageNum++) {
    console.log("Loading page " + pageNum)
    let url = baseUrl + "?size=250&page=" + pageNum
    await page.goto(url, { waitUntil: "load" })
    let newItems = await page.evaluate(extractItems)
    items = items.concat(newItems)
    if (await isLastPage(page)) break
  }
  return items
}

export default async function () {
  const browser = await puppeteer.launch({
    executablePath: "chrome.exe",
    headless: false,
  })
  const page = await browser.newPage()
  for (let locale of ["fr" /*,"en","pt","es"*/]) {
    const { baseUrl, folders } = urlParts[locale as keyof typeof urlParts]
    for (let folder of folders) {
      if (folder !== "armes") continue
      let url = baseUrl + folder
      let result = await navigateThroughPages(page, url)
      console.log("result:", result)
    }
  }
  console.log("Closing browser!")
  await browser.close()
}
