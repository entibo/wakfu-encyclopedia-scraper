import * as fs from "fs/promises"
import * as path from "path"
import { UnwrapPromiseLike } from "puppeteer"
import scrape, { ItemData } from "./scrape"

type ScrapeData = UnwrapPromiseLike<ReturnType<typeof scrape>>

const JSON_PATH = path.resolve(process.cwd(), "json")

async function saveItemNames(locale: string, list: ItemData[]) {
  let itemNames = list.reduce(
    (obj, item) => ((obj[item.id!] = item.title), obj),
    {} as Record<string, string>,
  )
  await fs.writeFile(
    path.join(JSON_PATH, `itemNames-${locale}.json`),
    JSON.stringify(itemNames, null, 2),
  )
}

async function saveCategoryNames(locale: string, list: ItemData[]) {
  let categoryNames = list.reduce(
    (obj, item) => ((obj[item.type] = item.typeTitle), obj),
    {} as Record<string, string>,
  )
  await fs.writeFile(
    path.join(JSON_PATH, `categoryNames-${locale}.json`),
    JSON.stringify(categoryNames, null, 2),
  )
}

async function saveItems(list: ItemData[]) {
  let items = list.reduce(
    (obj, { gfxId, level, id, rarity, type }) => (
      (obj[id!] = {
        gfxId: parseInt(gfxId!),
        level: parseInt(level),
        rarity: parseInt(rarity),
        type: parseInt(type),
      }),
      obj
    ),
    {} as Record<string, any>,
  )
  await fs.writeFile(
    path.join(JSON_PATH, `items.json`),
    JSON.stringify(items, null, 2),
  )
}

async function storeData(data: ScrapeData) {
  for (let [locale, list] of Object.entries(data)) {
    await saveItemNames(locale, list)
    await saveCategoryNames(locale, list)
  }
  await saveItems(data.fr)
}

function validateData(data: ScrapeData) {
  for (let [_, list] of Object.entries(data)) {
    for (let item of list) {
      if (!item.id || !item.gfxId) {
        throw "Missing properties in:\n" + JSON.stringify(item, null, 2)
      }
    }
  }
}

async function start() {
  let data = await scrape()
  validateData(data)
  await storeData(data)
  process.exit(0)
}
start()
