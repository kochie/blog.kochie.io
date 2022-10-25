import puppeteer from 'puppeteer'
import chrome from 'chrome-aws-lambda'
import { getAllArticlesMetadata } from '@/lib/article-path'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { join } from 'path'
// import authors from "metadata.yaml"

import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let _page: puppeteer.Page | null
let browser: puppeteer.Browser | null

// const exePath =
//   process.platform === 'win32'
//     ? 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
//     : process.platform === 'linux'
//     ? '/usr/bin/google-chrome'
//     : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

interface Options {
  args: string[]
  executablePath: string
  headless: boolean
}

type FileType = 'png' | 'jpeg'

export async function getOptions(isDev: boolean) {
  let options: Options
  if (isDev) {
    options = {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        '/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      headless: false,
    }
  } else {
    options = {
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    }
  }
  return options
}

export async function getPage() {
  if (_page) {
    return _page
  }
  // const options = await getOptions(isDev)
  browser = await puppeteer.launch({
    headless: true,
    args: ['--use-gl=egl'],
  })
  _page = await browser.newPage()
  return _page
}

export async function getScreenshot(
  html: string,
  type: FileType
  // isDev: boolean
) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--use-gl=egl', '--no-sandbox'],
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630 })
  await page.setContent(html)
  const file = await page.screenshot({ type })
  await browser.close()
  return file
}

const generateOpenGraph = async () => {
  const articles = await getAllArticlesMetadata()

  await mkdir('.temp/', { recursive: true })

  await Promise.all(
    articles.map(async (article) => {
      try {
        const p = join(__dirname, '../..', 'public/', article.jumbotron.url)

        const src = `data:image/jpeg;base64,${(await readFile(p)).toString(
          'base64'
        )}`
        const avatar = `data:image/png;base64,${(
          await readFile(
            join(__dirname, '../..', 'public', 'images/authors/kochie.png')
          )
        ).toString('base64')}`
        const logo = `data:image/png;base64,${(
          await readFile(
            join(__dirname, '../..', 'public', 'images/icons/blog-logo-512.png')
          )
        ).toString('base64')}`
        const html = `
        <!DOCTYPE html>
        <body style="margin: 0;">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap');
          </style>
          <div style="position: relative; background-image: url(${src}); width: 100vw; height: 100vh; background-size: cover; background-position: center; font-family: 'Roboto Condensed', sans-serif; ">
            <div style="display: flex; backdrop-filter: grayscale(0.2); width: 100vw; height: 100vh; flex-direction: column; align-items: flex-start; justify-content: center;">
              <div style="padding-left: 40px;">
                <span style="font-size: 80px; background-color: black; color: white; border-radius: 15px; padding: 10px;">${article.title}</span>
              </div>
            </div>
            <div style="position: absolute; bottom: 0; right: 0; margin: 30px; z-index: 100;">
              <img src=${avatar} width="100" height="100" style="border-radius: 25px;">
            </div>
            <div style="position: absolute; top: 0; right: 0; margin: 30px;">
              <img src=${logo} width="100" height="100">
            </div>
          </div>
        </body>
        `

        await writeFile(`.temp/${article.articleDir}.html`, html)
        const image = await getScreenshot(html, 'png')
        if (image) {
          await mkdir(join(__dirname, '../..', 'public', 'images/opengraph'), {
            recursive: true,
          })
          await writeFile(
            join(
              __dirname,
              '../..',
              'public',
              'images/opengraph',
              `${article.articleDir}.png`
            ),
            image
          )
        }
      } catch (err) {
        console.error(err)
      }
    })
  )

  await rm('.temp/', { recursive: true })

  browser?.close()
  // await _page?.close()
}

export { generateOpenGraph }
