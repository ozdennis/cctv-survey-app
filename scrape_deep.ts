import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function fetchHtml(url: string, retries = 3): Promise<string> {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            if (res.ok) return await res.text();
            console.warn(`Attempt ${i + 1} failed for ${url} with status ${res.status}`);
        } catch (error: any) {
            console.warn(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
        }
    }
    return '';
}

async function scrapeDeep() {
    try {
        console.log("Starting deep scrape of conceptteknologi.com...");
        const baseUrl = 'https://conceptteknologi.com';

        // 1. Get all category links from the main product page
        console.log("Fetching main page to discover categories...");
        const mainHtml = await fetchHtml(`${baseUrl}/product/`);
        const $main = cheerio.load(mainHtml);

        // The categories are usually in a sidebar widget or category grid
        const categoryLinks: { name: string, url: string }[] = [];

        // Let's try to extract from the category widget or grid links
        // Based on user image, categories are CCTV, ACCESS CONTROL, KABEL, etc.
        // Let's hardcode the common ones if dynamic discovery is tricky, but try dynamic first.
        $main('a').each((i, el) => {
            const href = $main(el).attr('href');
            if (href && href.includes('/product-category/') && !href.includes('page/')) {
                const text = $main(el).text().trim().replace(/\s*\(\d+\)\s*/g, ''); // Remove item counts like (52)
                if (text && text.length > 2 && !categoryLinks.some(c => c.url === href)) {
                    // Only push primary categories (might need filtering)
                    categoryLinks.push({ name: text, url: href.startsWith('http') ? href : baseUrl + href });
                }
            }
        });

        // Backup static categories if dynamic fails or gets too many tags
        const staticCategories = [
            { name: "CCTV", url: "https://conceptteknologi.com/product-category/cctv/" },
            { name: "ACCESS CONTROL", url: "https://conceptteknologi.com/product-category/access-control/" },
            { name: "KABEL", url: "https://conceptteknologi.com/product-category/kabel/" },
            { name: "MONITOR", url: "https://conceptteknologi.com/product-category/monitor/" },
            { name: "NETWORKING", url: "https://conceptteknologi.com/product-category/networking/" },
            { name: "POWER", url: "https://conceptteknologi.com/product-category/power/" },
            { name: "RECORDER", url: "https://conceptteknologi.com/product-category/recorder/" }
        ];

        const targetCats = categoryLinks.length > 0 ? categoryLinks : staticCategories;
        console.log(`Found ${targetCats.length} underlying categories.`);

        let allProducts: any[] = [];

        // 2. Fetch products per category
        for (const cat of staticCategories) { // Use static to be safe, matches the user's image exactly
            console.log(`\nScraping category: ${cat.name}`);
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const pageUrl = page === 1 ? cat.url : `${cat.url}page/${page}/`;
                console.log(`  -> Fetching ${pageUrl}`);
                const html = await fetchHtml(pageUrl);
                if (!html) break;

                const $ = cheerio.load(html);
                const productLinks: string[] = [];

                $('a[href*="/product/"]').each((i, el) => {
                    const href = $(el).attr('href');
                    if (href && !href.includes('/product-category/') && !href.includes('page/')) {
                        // Ensure it's not a generic action link
                        const text = $(el).text().trim();
                        if (!text.includes('Add to') && !text.includes('Quick') && !text.includes('Compare')) {
                            if (!productLinks.includes(href)) {
                                productLinks.push(href);
                            }
                        }
                    }
                });

                if (productLinks.length === 0) {
                    hasNextPage = false;
                    break;
                }

                // 3. Deep scrape each product page
                for (const pUrl of productLinks) {
                    console.log(`    -> Details: ${pUrl}`);
                    const pHtml = await fetchHtml(pUrl);
                    if (!pHtml) continue;

                    const $p = cheerio.load(pHtml);
                    // Fetch title and feature points
                    const title = $p('h1.product_title, h1').first().text().trim();
                    if (!title) continue;

                    const features: string[] = [];
                    // Look for bulleted lists inside the short desc or main body
                    $p('.woocommerce-product-details__short-description li, .product-short-description li, [data-id] li').each((i, el) => {
                        const txt = $p(el).text().trim();
                        if (txt) features.push(txt);
                    });

                    if (features.length === 0) {
                        const pText = $p('.woocommerce-product-details__short-description p, .product-short-description p').first().text().trim();
                        if (pText) features.push(pText);
                    }

                    // Format as nice bullet points text
                    const featureText = features.length > 0 ? '• ' + features.join('\n• ') : '';

                    allProducts.push({
                        name: title,
                        category: cat.name,
                        features: featureText
                    });

                    // Small delay to be polite
                    await new Promise(r => setTimeout(r, 200));
                }

                // Check for next page
                const nextLink = $('.next.page-numbers').attr('href');
                if (nextLink) {
                    page++;
                } else {
                    hasNextPage = false;
                }
            }
        }

        console.log(`\nFinished deep scrape. Total unique products: ${allProducts.length}`);

        // Generate SQL statements
        let sql = `-- Clear existing scraped data to refresh with rich data\n`;
        sql += `DELETE FROM public.camera_types WHERE type = 'Equipment';\n\n`;

        allProducts.forEach(p => {
            const escapedName = p.name.replace(/'/g, "''");
            const escapedCat = p.category.replace(/'/g, "''");
            const escapedFeatures = p.features.replace(/'/g, "''");

            sql += `INSERT INTO public.camera_types (name, type, resolution, category, features)\n`;
            sql += `VALUES ('${escapedName}', 'Equipment', 'Standard', '${escapedCat}', '${escapedFeatures}');\n`;
        });

        fs.writeFileSync('scraped_products_rich.sql', sql);
        console.log("Saved SQL to scraped_products_rich.sql");

    } catch (err) {
        console.error("Deep scrape error:", err);
    }
}

scrapeDeep();
