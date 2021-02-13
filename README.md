# wakfu-encyclopedia-scraper

This tool extracts basic information about all the items listed in the encyclopedia and exposes them in this format:

`json/items.json`
```
{
  "{id}": {
    "gfxId": {gfxId},
    "level": {0-215},
    "rarity": {0-7, default=1},
    "type": {default=-1}
  }
}
```

`json/itemNames-{locale}.json`
```
{
  "{id}": "{name}"
}
```