import * as puppeteer from "puppeteer";

const browser = puppeteer.launch({ headless: false });

const newPage = async () => {
  const page = await (await browser).newPage();
  await page.setViewport({ height: 800, width: 1200 });
  return page;
};

const crawl = async () => {
  // open main page
  const page = await newPage();

  // open github puppeteer readme
  await page.goto("https://github.com/GoogleChrome/puppeteer");

  // select all <a> elements
  const anchorElements = await page.$$("a");

  // get all "href" attributes from <a> elements on the page
  const urls = await Promise.all(
    anchorElements.map(async anchorElement =>
      (await anchorElement.getProperty("href")).jsonValue()
    )
  );

  // open each url in sequence, 1 second at a time
  for (const url of urls) {
    // open a new tab/page
    const childPage = await newPage();

    try {
      // go to url
      await childPage.goto(url);
      console.log(`opened ${url}`);

      // delay for 1 second
      await childPage.waitFor(1000);
    } catch (err) {
      console.log(`error: ${url}`);
      console.log(err);
    }

    // close page
    await childPage.close();
    console.log(`closed ${url}`);
  }

  // close main page
  await page.close();
};

crawl();
