module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/img");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");

  // Add a collection for blog posts
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md").reverse();
  });

  // Add a collection for featured posts
  eleventyConfig.addCollection("featuredPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md")
      .filter(post => post.data.featured === true)
      .slice(0, 4);
  });

  // Add a collection for recent posts
  eleventyConfig.addCollection("recentPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/posts/*.md")
      .reverse()
      .slice(0, 4);
  });

  // Add a filter to format dates
  eleventyConfig.addFilter("readableDate", dateObj => {
    return new Date(dateObj).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // Add a filter to get posts by category
  eleventyConfig.addFilter("filterByCategory", function(posts, category) {
    return posts.filter(post => {
      return post.data.categories && post.data.categories.includes(category);
    });
  });

  // Add a filter to get all unique categories
  eleventyConfig.addFilter("getAllCategories", function(collection) {
    let categories = new Set();
    collection.forEach(post => {
      if (post.data.categories) {
        post.data.categories.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};