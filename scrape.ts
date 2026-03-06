import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function scrapeProducts() {
    try {
        console.log("Fetching conceptteknologi.com/product/...");
        const res = await fetch('https://conceptteknologi.com/product/');
        const html = await res.text();
        const $ = cheerio.load(html);

        const products: { category: string; models: string[] }[] = [];

        // This is a simplified extraction pattern based on common WooCommerce/Wordpress HTML
        $('.product').each((i, el) => {
            const title = $(el).find('.woocommerce-loop-product__title').text().trim() || $(el).find('h2').text().trim() || $(el).find('h3').text().trim();
            if (title) {
                // Push to a default category for now
                if (products.length === 0) products.push({ category: "Cameras/Equipment", models: [] });
                products[0].models.push(title);
            }
        });

        // If that failed, let's try just getting all links that look like products
        if (!products.length || !products[0].models.length) {
            console.log("Specific product class not found. Extracting from general links...");
            const models = new Set<string>();
            $('a[href*="/product/"]').each((i, el) => {
                const text = $(el).text().trim();
                // Filter out generic links
                if (text && text.length > 4 && !text.includes('Add to') && !text.includes('Quick view') && !text.includes('Read more') && !text.includes('Compare') && !text.includes('wishlist')) {
                    models.add(text);
                }
            });
            if (models.size > 0) {
                products.push({ category: "Scraped Products", models: Array.from(models) });
            }
        }

        console.log(`Found ${products.reduce((acc, cat) => acc + cat.models.length, 0)} products.`);

        const sqlStatements = products.flatMap(cat =>
            cat.models.map(model => `insert into public.camera_types (name, type, resolution) values ('${model.replace(/'/g, "''")}', 'Equipment', 'Standard') on conflict do nothing;`)
        );

        fs.writeFileSync('scraped_products.sql', sqlStatements.join('\n'));
        console.log("Saved SQL to scraped_products.sql");

    } catch (err) {
        console.error("Error scraping:", err);
    }
}

scrapeProducts();
