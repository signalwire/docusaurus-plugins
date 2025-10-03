---
sidebar_position: 2
hide_table_of_contents: true
---

# Create a Document

Documents are **groups of pages** connected through:

- a **sidebar**
- **previous/next navigation**
- **versioning**

For more information about this tutorial section, see the [Tutorial - Basics overview](/docs/category/tutorial---basics).

You can also check out our [latest blog post](/blog/welcome) for more insights, or visit our [standalone blog section](/standalone-blog).

## Create your first Doc

Create a Markdown file at `docs/hello.md`:

```md title="docs/hello.md"
# Hello

This is my **first Docusaurus document**!
```

A new document is now available at
[http://localhost:3000/docs/hello](http://localhost:3000/docs/hello).

## Configure the Sidebar

Docusaurus automatically **creates a sidebar** from the `docs` folder.

Add metadata to customize the sidebar label and position:

```md title="docs/hello.md" {1-4}
---
sidebar_label: 'Hi!'
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```

It is also possible to create your sidebar explicitly in `sidebars.js`:

```js title="sidebars.js"
export default {
  tutorialSidebar: [
    'intro',
    // highlight-next-line
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
};
```


{/* Homepage-specific style customization */}
<style>{`.pagination-nav{display:none}`}</style>
<style>{`.theme-doc-breadcrumbs{display:none};`}</style>