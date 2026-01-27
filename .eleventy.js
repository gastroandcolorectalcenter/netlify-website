const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

module.exports = function(eleventyConfig) {
  
  // ========================================
  // PASSTHROUGH COPY - Static Assets
  // ========================================
  eleventyConfig.addPassthroughCopy("src/assets/css");
  eleventyConfig.addPassthroughCopy("src/assets/js");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");

  // ========================================
  // WATCH TARGETS - Auto-reload on changes
  // ========================================
  eleventyConfig.addWatchTarget("src/assets/css/");
  eleventyConfig.addWatchTarget("src/assets/js/");

  // ========================================
  // FILTERS - For use in templates
  // ========================================
  
  // Format dates for blog posts
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy");
  });

  // ISO date format for datetime attributes
  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get current year for footer
  eleventyConfig.addFilter("currentYear", () => {
    return new Date().getFullYear();
  });

  // Limit array length (for recent blogs)
  eleventyConfig.addFilter("limit", (array, limit) => {
    return array.slice(0, limit);
  });

  // Intersection filter (shared tags) - added from gpt later
  eleventyConfig.addFilter("intersection", (arr1 = [], arr2 = []) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return [];
    }
    return arr1.filter(item => arr2.includes(item));
  });

  // Filter featured blogs
  eleventyConfig.addFilter("featured", (array) => {
    return array.filter(item => item.data.featured === true);
  });

  // Get unique categories from all blog posts
  eleventyConfig.addFilter("getAllCategories", (collection) => {
    let categories = new Set();
    collection.forEach(item => {
      if (item.data.category) {
        if (Array.isArray(item.data.category)) {
          item.data.category.forEach(cat => categories.add(cat));
        } else {
          categories.add(item.data.category);
        }
      }
    });
    return Array.from(categories).sort();
  });

  // Filter posts by category
  eleventyConfig.addFilter("filterByCategory", (posts, category) => {
    return posts.filter(post => {
      if (Array.isArray(post.data.category)) {
        return post.data.category.includes(category);
      }
      return post.data.category === category;
    });
  });

  // Normalize category for comparison
  eleventyConfig.addFilter("normalizeCategory", (category) => {
    if (!category) return "";
    return category.toString().toLowerCase().trim().replace(/\s+/g, '-');
  });

  // Add this function in .eleventy.js
  eleventyConfig.addFilter("getCategoryFromPath", (path) => {
    const match = path.match(/blogs\/([^\/]+)\//);
    if (match && match[1] !== 'blogs') {
      // Convert folder name to title case
      return match[1].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return null;
  });

  // ADD THIS: URL encode filter for social sharing
  eleventyConfig.addFilter("urlencode", (value) => {
    return encodeURIComponent(value || '');
  });

  // Wrap markdown <img> tags with <picture> using WebP + original fallback
  eleventyConfig.addFilter("addWebpToImages", (content = "") => {
    return content.replace(/<img\b([^>]*?)\s+src=(["'])([^"']+)\2([^>]*)>/gi, (match, preAttrs, quote, src, postAttrs) => {
      const extMatch = src.match(/\.(jpe?g|png)(\?.*)?$/i);
      if (!extMatch) {
        return match;
      }
      const ext = extMatch[1].toLowerCase();
      const webpSrc = src.replace(/\.(jpe?g|png)(\?.*)?$/i, ".webp$2");
      const fallbackType = ext === "png" ? "image/png" : "image/jpeg";
      const attrs = `${preAttrs || ""} ${postAttrs || ""}`;
      const srcsetMatch = attrs.match(/\s+srcset=(["'])([^"']+)\1/i);
      let webpSrcset = "";

      if (srcsetMatch) {
        const srcsetValue = srcsetMatch[2];
        const entries = srcsetValue.split(",").map(item => item.trim()).filter(Boolean);
        const webpEntries = entries.map(entry => {
          const parts = entry.split(/\s+/);
          const url = parts[0];
          const descriptor = parts.slice(1).join(" ");
          const webpUrl = url.match(/\.(jpe?g|png)(\?.*)?$/i)
            ? url.replace(/\.(jpe?g|png)(\?.*)?$/i, ".webp$2")
            : url;
          return descriptor ? `${webpUrl} ${descriptor}` : webpUrl;
        });
        webpSrcset = webpEntries.join(", ");
      }

      const webpSource = webpSrcset
        ? `<source srcset="${webpSrcset}" type="image/webp">`
        : `<source srcset="${webpSrc}" type="image/webp">`;

      return `<picture>${webpSource}<source srcset="${src}" type="${fallbackType}">${match}</picture>`;
    });
  });

  // ========================================
  // COLLECTIONS - Organize content
  // ========================================
  
  // All blog posts sorted by date (newest first)
  eleventyConfig.addCollection("blogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blogs/**/*.md")
      .sort((a, b) => b.date - a.date);
  });

  // Recent blog posts (latest 3)
  eleventyConfig.addCollection("recentBlogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blogs/**/*.md")
      .sort((a, b) => b.date - a.date)
      .slice(0, 3);
  });

  // Featured blog posts
  eleventyConfig.addCollection("featuredBlogs", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blogs/**/*.md")
      .filter(item => item.data.featured === true)
      .sort((a, b) => b.date - a.date)
      .slice(0, 3);
  });

  // All services
  eleventyConfig.addCollection("allServices", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/services/*.md")
      .sort((a, b) => {
        return (a.data.order || 999) - (b.data.order || 999);
      });
  });

  // ========================================
  // SHORTCODES - Reusable components
  // ========================================
  
  // Year shortcode for copyright
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // SVG icon shortcode
  eleventyConfig.addShortcode("svg", function(name) {
    return `{% include "svg/${name}.njk" %}`;
  });

  // ========================================
  // MARKDOWN CONFIGURATION
  // ========================================
  
  // OPTION 1: Disable anchors for service pages only (RECOMMENDED)
  // Create two markdown libraries - one with anchors, one without
  
  // Markdown WITH anchors (for blogs)
  let markdownLibraryWithAnchors = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  }).use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "header-anchor",
      symbol: "#",
      ariaHidden: false,
    }),
    level: [1, 2, 3, 4],
    slugify: eleventyConfig.getFilter("slugify")
  });

  // Markdown WITHOUT anchors (for services)
  let markdownLibraryWithoutAnchors = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true
  });

  // Set the default library (with anchors for blogs)
  eleventyConfig.setLibrary("md", markdownLibraryWithAnchors);

  // Add a transform to remove anchors from service pages ONLY
  eleventyConfig.addTransform("removeServiceAnchors", function(content, outputPath) {
    // Only apply to service pages
    if (outputPath && outputPath.includes("/services/") && outputPath.endsWith(".html")) {
      // Remove header anchor links
      content = content.replace(/<a class="header-anchor"[^>]*>#<\/a>/g, '');
      // Also remove any direct-link class anchors
      content = content.replace(/<a class="direct-link"[^>]*>#<\/a>/g, '');
    }
    return content;
  });

  // ========================================
  // BROWSERSYNC CONFIGURATION
  // ========================================
  
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = require('fs').readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  // ========================================
  // RETURN CONFIGURATION
  // ========================================
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
