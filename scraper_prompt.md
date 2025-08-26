### **Prompt for Building a Product Page Scraping Service**

**Objective:**

Create a web scraping service that takes the URL of a product page as input, extracts all relevant product information, and outputs a JSON object. This JSON object must be in the exact format required to be sent to our Product Creation API.

**Input:**

*   A single URL to a product detail page (e.g., `https://www.example-store.com/products/a-specific-chair`).

**Extraction Requirements:**

The service must intelligently scrape the page to find and extract the following data points. The scraper should be robust enough to handle common e-commerce page layouts.

1.  **`name`**: The main product title (usually found in an `<h1>` or similar prominent heading).
2.  **`ref` (SKU)**: The product's Stock Keeping Unit or reference number. Look for labels like "SKU:", "Ref:", "Model:", or "Item #".
3.  **`price` & `cost`**: The main price of the product. The scraper should be able to parse formatted prices (e.g., "$1,234.56") into a numeric format. The `cost` field can be omitted if not available.
4.  **`category_id` & `brand_id`**: These will likely not be on the page. The service can either ignore them (they will be added manually later) or try to infer them from breadcrumbs (for category) or a brand logo/link. For now, you can default them to `null` or a placeholder.
5.  **Descriptions (`description`, `technical_details`, `features`)**: Scrape the product description sections. These are often in tabs or separate `div` elements. **The content for these fields must be extracted as raw HTML.**
6.  **`images`**:
    *   Find the main product image gallery.
    *   Extract the URL for each high-resolution image (not the thumbnails).
    *   **Crucially**, if the page has color swatches (e.g., clickable color circles), the scraper must try to associate an image with a color. For example, if clicking the "Red" swatch changes the main image, the scraper should link that image's URL to the "Red" color's temporary ID (see below).
7.  **`colors`**:
    *   Find the color options/swatches on the page.
    *   For each color, extract its name (e.g., "Midnight Black").
    *   Generate a unique temporary ID for each color (e.g., `_tempId: "temp_black"`).
8.  **`sizes`**:
    *   Find the size options (e.g., a dropdown list or buttons).
    *   For each size, extract its name (e.g., "Large") and code (e.g., "L").
    *   If exist other variants like "With xxx", "With out xxx", etc., extract them similarly.
    *   Use size for other variants where is not color.
    *   Generate a unique temporary ID for each size (e.g., `_tempId: "temp_large"`).
9.  **`attributes`**: Scrape any additional specification lists (e.g., a "Specifications" table) and format them as key/value pairs.
10. **`variants`**: This is the most complex part. The service should detect if selecting different combinations of color and size changes the SKU or price. If so, it should create a variant object for each combination it can identify, linking the respective `color_temp_id` and `size_temp_id`.

**Output Format:**

The final output must be a single JSON object that strictly adheres to the following structure.

```json
{
  "name": "Modern Ergonomic Chair",
  "ref": "CHAIR-ERGO-2025",
  "price": 0,
  "description": "<p>A <b>stylish and comfortable</b> ergonomic chair, perfect for long hours at the office or home.</p>",
  "technical_details": "<ul><li><strong>Material:</strong> Breathable Mesh, Aluminum Base</li><li><strong>Max Weight:</strong> 150kg</li></ul>",
  "features": "<ul><li>Adjustable lumbar support</li><li>4D Armrests</li><li>Tilt and lock mechanism</li></ul>",
  "certification": "BIFMA Certified",
  "description_pdf_url": "https://matonyservicos.com/files/products/pdfs/m4t3DXpTmt4Iss3VnSX7ROqxdPfeHnZP9utbdFTv.pdf",
  "images": [
    {
      "url": "https://matonyservicos.com/files/products/kjHQGuoMtUBeRYWVhzfUYlsX5fMsJXZPJrJenNxA.png",
      "color_temp_id": "temp_black"
    },
    {
      "url": "https://matonyservicos.com/files/products/kjHQGuoMtUBeRYWVhzfUYlsX5fMsJXZPJrJenNxA.png",
      "color_temp_id": "temp_white"
    },
    {
      "url": "https://matonyservicos.com/files/products/kjHQGuoMtUBeRYWVhzfUYlsX5fMsJXZPJrJenNxA.png"
    }
  ],
  "colors": [
    {
      "_tempId": "temp_black",
      "name": "Midnight Black",
      "hex_code": "#000000"
    },
    {
      "_tempId": "temp_white",
      "name": "Arctic White",
      "hex_code": "#FFFFFF"
    }
  ],
  "sizes": [
    {
      "_tempId": "temp_m",
      "name": "Medium",
      "code": "M"
    },
    {
      "_tempId": "temp_l",
      "name": "Large",
      "code": "L"
    }
  ],
  "attributes": [
    {
      "name": "Base Material",
      "value": "Polished Aluminum"
    },
    {
      "name": "Headrest",
      "value": "Included"
    }
  ],
  "variants": [
    {
      "color_temp_id": "temp_white",
      "size_temp_id": "temp_l",
      "sku": "CHAIR-ERGO-WHT-L",
      "price": null,
      "stock": 0
    },
    {
      "color_temp_id": "temp_white",
      "size_temp_id": null,
      "sku": "CHAIR-ERGO-WHT",
      "price": null,
      "stock": 0
    }
  ]
}
```

**Suggested Technology:**

*   **Language:** Python
*   **Libraries:**
    *   `Requests` for making HTTP requests.
    *   `BeautifulSoup4` or `lxml` for parsing HTML.
    *   Consider using a more advanced framework like `Scrapy` for complex sites or multiple-page scraping.

**Final Deliverable:**

A command-line script or a simple web service that accepts a URL and prints the final JSON object to standard output or returns it as an HTTP response.
