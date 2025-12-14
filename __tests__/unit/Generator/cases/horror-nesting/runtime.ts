import type { HorrorNestingQuery } from './result'

/**
 * Runtime type tests for the horror nesting query.
 * These tests are written based on what the types SHOULD be according to
 * the GraphQL query structure, NOT based on what the generator outputs.
 */
export default function (query: HorrorNestingQuery): void {
  // ==========================================================================
  // CONTENT FIELD - Content interface (Article | Page)
  // ==========================================================================
  const content = query.content
  if (!content) return

  // __typename is selected, should be available for narrowing
  console.log(content.__typename)

  // From nodeFields fragment (on Node interface which Content extends)
  console.log(content.id)
  console.log(content.uuid)

  // From displayableFields fragment (on Displayable interface which Content extends)
  console.log(content.title)
  console.log(content.description)

  // From contentBaseFields fragment + inline Content spread (overlapping)
  console.log(content.tags)

  // author is selected in inline Content spread - available on both Article and Page
  if (content.author) {
    // From personBasic fragment + inline Person spread
    console.log(content.author.id)
    console.log(content.author.name)
    console.log(content.author.email)
  }

  // Type narrowing to Article
  if (content.__typename === 'Article') {
    // From articleFields fragment + inline Article spread
    console.log(content.body)
    console.log(content.excerpt)
    console.log(content.publishedAt)

    // featuredMedia is a union (MediaItem: Image | Video | Document | AudioClip)
    if (content.featuredMedia) {
      console.log(content.featuredMedia.__typename)

      // From mediaItemFields fragment - base fields available on all types
      if ('id' in content.featuredMedia) {
        console.log(content.featuredMedia.id)
      }
      if ('url' in content.featuredMedia) {
        console.log(content.featuredMedia.url)
      }

      if (content.featuredMedia.__typename === 'Image') {
        // From inline Image spread + imageFields inherited via mediaItemFields
        console.log(content.featuredMedia.alt)
        if (content.featuredMedia.photographer) {
          console.log(content.featuredMedia.photographer.id)
          console.log(content.featuredMedia.photographer.name)
          // Nested articles
          if (content.featuredMedia.photographer.articles) {
            for (const art of content.featuredMedia.photographer.articles) {
              // From articleShallow fragment
              console.log(art.id)
              console.log(art.title)
              console.log(art.slug)
              console.log(art.excerpt)
            }
          }
        }
      }

      if (content.featuredMedia.__typename === 'Video') {
        console.log(content.featuredMedia.duration)
        if (content.featuredMedia.thumbnail) {
          // From imageFields fragment
          console.log(content.featuredMedia.thumbnail.url)
          console.log(content.featuredMedia.thumbnail.alt)
          console.log(content.featuredMedia.thumbnail.width)
        }
        if (content.featuredMedia.director) {
          console.log(content.featuredMedia.director.name)
          console.log(content.featuredMedia.director.id)
        }
      }
    }

    // blocks is a union array (BlockContent: TextBlock | MediaBlock | EmbedBlock | NestedBlock)
    if (content.blocks) {
      for (const block of content.blocks) {
        console.log(block.__typename)

        // From blockFields fragment - each type has id
        if ('id' in block) {
          console.log(block.id)
        }

        if (block.__typename === 'TextBlock') {
          console.log(block.html)
        }

        if (block.__typename === 'MediaBlock') {
          console.log(block.caption)
          // Nested media union
          if (block.media) {
            console.log(block.media.__typename)
            if (block.media.__typename === 'Image') {
              // From imageFields fragment
              console.log(block.media.url)
              console.log(block.media.alt)
              if (block.media.photographer) {
                console.log(block.media.photographer.name)
              }
            }
            if (block.media.__typename === 'Video') {
              // From videoFields fragment
              console.log(block.media.url)
              console.log(block.media.duration)
            }
          }
        }

        if (block.__typename === 'NestedBlock') {
          console.log(block.title)
          // Recursive blocks - level 2
          if (block.blocks) {
            for (const innerBlock of block.blocks) {
              console.log(innerBlock.__typename)
              if (innerBlock.__typename === 'TextBlock') {
                console.log(innerBlock.html)
              }
              if (innerBlock.__typename === 'NestedBlock') {
                console.log(innerBlock.title)
                // Level 3 blocks
                if (innerBlock.blocks) {
                  for (const deepBlock of innerBlock.blocks) {
                    console.log(deepBlock.__typename)
                    if (deepBlock.__typename === 'TextBlock') {
                      console.log(deepBlock.plain)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // relatedContent is Content interface (Article | Page)
    if (content.relatedContent) {
      for (const related of content.relatedContent) {
        console.log(related.__typename)
        // From contentBaseFields fragment
        console.log(related.id)
        console.log(related.uuid)
        console.log(related.title)
        console.log(related.tags)

        if (related.__typename === 'Article') {
          console.log(related.excerpt)
          if (related.author) {
            console.log(related.author.name)
          }
        }

        if (related.__typename === 'Page') {
          if (related.sections) {
            for (const section of related.sections) {
              // From sectionShallow fragment
              console.log(section.id)
              console.log(section.heading)
            }
          }
        }
      }
    }
  }

  // Type narrowing to Page
  if (content.__typename === 'Page') {
    // From pageFields fragment + inline Page spread
    console.log(content.body)
    if (content.author) {
      console.log(content.author.id)
      console.log(content.author.name)
    }

    // sections with recursive subsections
    if (content.sections) {
      for (const section of content.sections) {
        // From sectionDeep fragment
        console.log(section.id)
        console.log(section.heading)

        // content is BlockContent union
        if (section.content) {
          console.log(section.content.__typename)
          if (section.content.__typename === 'MediaBlock') {
            if (section.content.media) {
              console.log(section.content.media.__typename)
            }
          }
        }

        // relatedMedia array
        if (section.relatedMedia) {
          for (const media of section.relatedMedia) {
            console.log(media.__typename)
          }
        }

        // Recursive subsections - level 2
        if (section.subsections) {
          for (const sub of section.subsections) {
            console.log(sub.id)
            console.log(sub.heading)
            // Level 3 subsections
            if (sub.subsections) {
              for (const deepSub of sub.subsections) {
                console.log(deepSub.id)
                console.log(deepSub.heading)
                if (deepSub.content) {
                  console.log(deepSub.content.__typename)
                  if (deepSub.content.__typename === 'TextBlock') {
                    console.log(deepSub.content.html)
                  }
                }
              }
            }
          }
        }
      }
    }

    // parent is recursive Page
    if (content.parent) {
      // From pageShallow fragment
      console.log(content.parent.id)
      console.log(content.parent.title)
      console.log(content.parent.url)
      console.log(content.parent.slug)
      // Nested parent
      if (content.parent.parent) {
        console.log(content.parent.parent.title)
        console.log(content.parent.parent.url)
      }
    }

    // children is recursive Page array
    if (content.children) {
      for (const child of content.children) {
        // From pageShallow fragment
        console.log(child.id)
        console.log(child.title)
        // Nested children
        if (child.children) {
          for (const grandchild of child.children) {
            console.log(grandchild.title)
            if (grandchild.sections) {
              for (const s of grandchild.sections) {
                console.log(s.id)
              }
            }
          }
        }
      }
    }

    // navigation is Linkable interface (Article | Category | Page | Product)
    if (content.navigation) {
      for (const nav of content.navigation) {
        console.log(nav.__typename)
        // From linkableFields fragment - common to all Linkable types
        console.log(nav.url)
        console.log(nav.slug)

        if (nav.__typename === 'Article') {
          console.log(nav.excerpt)
        }
        if (nav.__typename === 'Page') {
          console.log(nav.body)
        }
        if (nav.__typename === 'Product') {
          console.log(nav.price)
        }
        if (nav.__typename === 'Category') {
          console.log(nav.name)
        }
      }
    }
  }

  // ==========================================================================
  // MEDIA FIELD - MediaItem union (Image | Video | Document | AudioClip)
  // All types are covered, so no empty object needed
  // ==========================================================================
  const media = query.media
  if (media) {
    console.log(media.__typename)

    // From mediaItemFields - all types have these via inline spreads
    if ('id' in media) console.log(media.id)
    if ('url' in media) console.log(media.url)

    if (media.__typename === 'Image') {
      // From imageFields fragment
      console.log(media.alt)
      console.log(media.width)
      console.log(media.height)
      console.log(media.caption)
      if (media.photographer) {
        // From personFull fragment
        console.log(media.photographer.id)
        console.log(media.photographer.name)
        console.log(media.photographer.email)
        console.log(media.photographer.role)
      }
    }

    if (media.__typename === 'Video') {
      // From videoFields fragment
      console.log(media.duration)
      console.log(media.transcript)
      if (media.thumbnail) {
        console.log(media.thumbnail.url)
        console.log(media.thumbnail.alt)
        if (media.thumbnail.photographer) {
          console.log(media.thumbnail.photographer.name)
        }
      }
      if (media.director) {
        console.log(media.director.name)
        console.log(media.director.email)
        if (media.director.articles) {
          for (const art of media.director.articles) {
            console.log(art.title)
            if (art.featuredMedia) {
              console.log(art.featuredMedia.__typename)
              if (art.featuredMedia.__typename === 'Image') {
                console.log(art.featuredMedia.url)
              }
            }
          }
        }
      }
    }

    if (media.__typename === 'Document') {
      // From documentFields fragment
      console.log(media.filename)
      console.log(media.mimeType)
      console.log(media.size)
      if (media.uploadedBy) {
        console.log(media.uploadedBy.id)
        console.log(media.uploadedBy.name)
      }
    }

    if (media.__typename === 'AudioClip') {
      console.log(media.duration)
      if (media.artist) {
        console.log(media.artist.id)
        console.log(media.artist.name)
        if (media.artist.articles) {
          for (const art of media.artist.articles) {
            console.log(art.id)
            console.log(art.title)
            console.log(art.excerpt)
          }
        }
      }
    }
  }

  // ==========================================================================
  // SEARCH FIELD - SearchResult union array (Article | Page | Person | Product)
  // ==========================================================================
  for (const result of query.search) {
    console.log(result.__typename)

    // From inline Node spread - Article, Page, Person, Product all implement Node
    console.log(result.id)
    console.log(result.uuid)

    // From inline Displayable spread - Article, Page, Product implement Displayable
    // Person does NOT implement Displayable, so title/description need narrowing
    if ('title' in result) {
      console.log(result.title)
      console.log(result.description)
    }

    // From inline Linkable spread - Article, Page, Product, Category implement Linkable
    // Person does NOT implement Linkable, so url/slug need narrowing
    if ('url' in result) {
      console.log(result.url)
      console.log(result.slug)
    }

    if (result.__typename === 'Article') {
      // From articleFields fragment
      console.log(result.body)
      console.log(result.excerpt)
      console.log(result.publishedAt)
      if (result.relatedContent) {
        for (const related of result.relatedContent) {
          console.log(related.__typename)
          if (related.__typename === 'Article') {
            console.log(related.id)
            console.log(related.title)
            if (related.blocks) {
              for (const block of related.blocks) {
                console.log(block.__typename)
                if (block.__typename === 'NestedBlock') {
                  if (block.blocks) {
                    for (const inner of block.blocks) {
                      console.log(inner.__typename)
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    if (result.__typename === 'Page') {
      // From pageFields fragment
      console.log(result.body)
      if (result.sections) {
        for (const section of result.sections) {
          console.log(section.id)
          console.log(section.heading)
        }
      }
    }

    if (result.__typename === 'Product') {
      console.log(result.price)
      if (result.media) {
        for (const m of result.media) {
          console.log(m.__typename)
        }
      }
      if (result.variants) {
        for (const v of result.variants) {
          console.log(v.id)
          console.log(v.name)
          console.log(v.sku)
          console.log(v.price)
          if (v.image) {
            console.log(v.image.url)
            console.log(v.image.alt)
          }
        }
      }
      if (result.relatedProducts) {
        for (const rp of result.relatedProducts) {
          console.log(rp.title)
          console.log(rp.price)
          if (rp.media) {
            for (const m of rp.media) {
              console.log(m.__typename)
              if (m.__typename === 'Image') {
                console.log(m.url)
                console.log(m.alt)
              }
            }
          }
        }
      }
      if (result.category) {
        // From categoryDeep fragment
        console.log(result.category.id)
        console.log(result.category.name)
        console.log(result.category.slug)
        if (result.category.parent) {
          console.log(result.category.parent.id)
          console.log(result.category.parent.name)
          if (result.category.parent.parent) {
            console.log(result.category.parent.parent.id)
          }
        }
        if (result.category.children) {
          for (const child of result.category.children) {
            console.log(child.id)
            console.log(child.name)
          }
        }
      }
    }

    if (result.__typename === 'Person') {
      // From personFull fragment
      console.log(result.name)
      console.log(result.email)
      console.log(result.role)
      if (result.avatar) {
        console.log(result.avatar.url)
        console.log(result.avatar.alt)
      }
      if (result.articles) {
        for (const art of result.articles) {
          console.log(art.id)
          console.log(art.title)
          if (art.category) {
            console.log(art.category.name)
          }
        }
      }
      if (result.managedProducts) {
        for (const prod of result.managedProducts) {
          console.log(prod.title)
          console.log(prod.price)
        }
      }
    }
  }

  // ==========================================================================
  // ARTICLE FIELD - Concrete Article type (no union)
  // ==========================================================================
  const article = query.article
  if (article) {
    // Merged from articleFields, articleShallow, contentBaseFields + inline
    console.log(article.id)
    console.log(article.uuid)
    console.log(article.title)
    console.log(article.slug)
    console.log(article.body)
    console.log(article.excerpt)
    console.log(article.publishedAt)
    console.log(article.tags)

    // author with personFull fragment + avatar
    if (article.author) {
      console.log(article.author.id)
      console.log(article.author.name)
      console.log(article.author.email)
      console.log(article.author.role)
      if (article.author.avatar) {
        console.log(article.author.avatar.url)
        console.log(article.author.avatar.alt)
        console.log(article.author.avatar.width)
        console.log(article.author.avatar.height)
        console.log(article.author.avatar.caption)
      }
    }

    // category with categoryDeep fragment
    if (article.category) {
      console.log(article.category.id)
      console.log(article.category.name)
      console.log(article.category.slug)
      if (article.category.parent) {
        console.log(article.category.parent.id)
        console.log(article.category.parent.name)
      }
    }
  }

  // ==========================================================================
  // LINKABLE FIELD - Linkable interface (Article | Category | Page | Product)
  // ==========================================================================
  const linkable = query.linkable
  if (linkable) {
    console.log(linkable.__typename)
    // From linkableFields fragment - common to all
    console.log(linkable.url)
    console.log(linkable.slug)

    if (linkable.__typename === 'Article') {
      // From articleFields fragment
      console.log(linkable.body)
      console.log(linkable.excerpt)
      console.log(linkable.publishedAt)
      if (linkable.author) {
        console.log(linkable.author.name)
      }
    }

    if (linkable.__typename === 'Page') {
      console.log(linkable.body)
      if (linkable.parent) {
        console.log(linkable.parent.title)
      }
    }

    if (linkable.__typename === 'Product') {
      console.log(linkable.price)
      if (linkable.variants) {
        for (const v of linkable.variants) {
          console.log(v.name)
          console.log(v.sku)
        }
      }
    }

    if (linkable.__typename === 'Category') {
      console.log(linkable.name)
      if (linkable.parent) {
        console.log(linkable.parent.name)
      }
      if (linkable.children) {
        for (const child of linkable.children) {
          console.log(child.name)
        }
      }
    }
  }

  // ==========================================================================
  // ALL CONTENT FIELD - Content interface array (Article | Page)
  // ==========================================================================
  for (const item of query.allContent) {
    console.log(item.__typename)
    // From contentBaseFields fragment
    console.log(item.id)
    console.log(item.uuid)
    console.log(item.title)
    console.log(item.tags)

    if (item.__typename === 'Article') {
      console.log(item.excerpt)
      if (item.blocks) {
        for (const block of item.blocks) {
          console.log(block.__typename)
          if (block.__typename === 'TextBlock') {
            console.log(block.html)
          }
          if (block.__typename === 'MediaBlock') {
            console.log(block.caption)
          }
        }
      }
    }

    if (item.__typename === 'Page') {
      console.log(item.body)
      if (item.sections) {
        for (const section of item.sections) {
          console.log(section.id)
          console.log(section.heading)
        }
      }
    }
  }
}
